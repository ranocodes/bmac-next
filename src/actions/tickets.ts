"use server";

import { db } from "@/lib/db";
import { findOrCreatePerson, ensurePersonRoles, upsertPersonRecord } from "./people";
import { createWorkflowRecord, resolveWorkflow } from "@/lib/workflows";
import { createTicket, reserveCapacity, releaseCapacity, getTicketById } from "@/lib/tickets";
import type { EventTicketRow } from "@/lib/tickets";
import { promoteFromWaitlist } from "@/actions/waitlist";
import { verifyPaystackTransaction } from "@/lib/paystack-confirm";

interface EventOrderRow {
  id: string;
  title: string;
  is_paid: boolean;
  price: number;
  date: string;
  venue: string;
}

export async function createTicketOrder(opts: {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  quantity?: number;
  consent?: boolean;
}): Promise<{
  error?: string;
  reference?: string;
  amountKobo?: number;
  ticketId?: string;
}> {
  if (!opts.consent) return { error: "Consent is required to purchase a ticket." };
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  const quantity = Math.max(1, opts.quantity || 1);
  const rows = await db.query<EventOrderRow>(
    "SELECT id, title, is_paid, price, date, venue FROM public.events WHERE id = $1",
    [opts.eventId]
  );
  const event = rows[0];
  if (!event) return { error: "Event not found" };
  if (!event.is_paid) return { error: "This event is free — use the register form." };

  const used = await reserveCapacity(opts.eventId, quantity);
  if (used === null) return { error: "This event is sold out" };

  try {
    const person = await findOrCreatePerson({
      firstName: opts.name,
      email: opts.email,
      phone: opts.phone,
    });
    if (!person) {
      await releaseCapacity(opts.eventId, quantity);
      return { error: "Something went wrong. Try again." };
    }
    await ensurePersonRoles(person.id, ["attendee"]);
    await upsertPersonRecord(person.id, "event_registration", {
      refId: opts.eventId,
      refTitle: event.title,
      status: "pending",
      meta: { quantity },
    });
    const amountKobo = Number(event.price || 0) * quantity * 100;
    const ticket = await createTicket({
      eventId: opts.eventId,
      personId: person.id,
      payerName: opts.name,
      payerEmail: opts.email,
      quantity,
      amount: Number(event.price || 0) * 100,
      status: "pending",
    });
    if (!ticket) {
      await releaseCapacity(opts.eventId, quantity);
      return { error: "Something went wrong. Try again." };
    }
    await createWorkflowRecord({
      kind: "ticket",
      refId: ticket.id,
      title: `Paid ticket order: ${event.title}`,
      summary: `${opts.name} ordered ${quantity} pass${quantity > 1 ? "es" : ""} for ${event.title}`,
      status: "open",
      submitterName: opts.name,
      submitterEmail: opts.email,
      source: "event",
      details: { eventId: opts.eventId, reference: ticket.reference, quantity },
      outcome: "Awaiting payment verification",
    });
    return {
      reference: ticket.reference,
      amountKobo,
      ticketId: ticket.id,
    };
  } catch (err) {
    await releaseCapacity(opts.eventId, quantity);
    console.error("createTicketOrder error:", err);
    return { error: "Something went wrong. Try again." };
  }
}

export async function getTicketStatus(reference: string): Promise<{
  status: string;
  passUrl?: string;
}> {
  const rows = await db.query<EventTicketRow>(
    "SELECT * FROM public.event_tickets WHERE reference = $1",
    [reference]
  );
  if (!rows.length) return { status: "not_found" };
  const t = rows[0];
  return { status: t.status, passUrl: t.qr_token ? `/pass/${t.qr_token}` : undefined };
}

export async function verifyTicketPayment(reference: string): Promise<{
  status: string;
  passUrl?: string;
  error?: string;
}> {
  if (!reference) return { status: "not_found" };
  const result = await verifyPaystackTransaction(reference);
  if (result.status !== "completed") return { status: result.status, error: result.error };
  return getTicketStatus(reference);
}

export async function cancelTicket(ticketId: string): Promise<{ error?: string }> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return { error: "Ticket not found" };
  if (ticket.status !== "pending") return { error: "Only pending tickets can be cancelled" };
  await db.query(
    "UPDATE public.event_tickets SET status = 'cancelled', updated_at = now() WHERE id = $1",
    [ticketId]
  );
  await releaseCapacity(ticket.event_id, ticket.quantity);
  await promoteFromWaitlist(ticket.event_id, ticket.quantity);
  const wf = await db.query<{ id: string }>(
    "SELECT id FROM public.workflow_records WHERE kind = 'ticket' AND ref_id = $1 LIMIT 1",
    [ticketId]
  );
  if (wf.length) await resolveWorkflow(wf[0].id, "Ticket order cancelled");
  return {};
}
