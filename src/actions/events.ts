"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
import { findOrCreatePerson, ensurePersonRoles, upsertPersonRecord } from "./people";
import { createWorkflowRecord } from "@/lib/workflows";
import { createAdminNotification } from "@/lib/notifications";
import { sendRegistrationConfirmedEmail, sendEventReminderEmail } from "@/lib/email";
import {
  createTicket,
  reserveCapacity,
  releaseCapacity,
  passUrlFor,
  checkInTicket,
} from "@/lib/tickets";
import type { EventTicketRow } from "@/lib/tickets";

interface EventRow {
  id: string;
  title: string;
  date: string;
  venue: string;
  time: string;
  category: string;
  description: string;
  long_desc: string;
  is_paid: boolean;
  price: number;
  capacity: number;
  capacity_used: number;
  registration_deadline: string;
  max_per_person: number;
  allow_public_registration: boolean;
  reminders_enabled: boolean;
  status: string;
}

export interface EventRegistrant {
  ticketId: string;
  reference: string;
  payerName: string;
  payerEmail: string;
  quantity: number;
  amount: number;
  currency: string;
  status: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  personId: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface EventAdminDetail {
  event: {
    id: string;
    title: string;
    date: string;
    venue: string;
    time: string;
    category: string;
    is_paid: boolean;
    price: number;
    capacity: number;
    capacity_used: number;
    registration_deadline: string;
    max_per_person: number;
    allow_public_registration: boolean;
    reminders_enabled: boolean;
    status: string;
    registrations: number;
    confirmed: number;
    checkedIn: number;
    revenue: number;
  };
  registrants: EventRegistrant[];
}

async function eventById(eventId: string): Promise<EventRow | null> {
  const rows = await db.query<EventRow>("SELECT * FROM public.events WHERE id = $1", [eventId]);
  return rows.length ? rows[0] : null;
}

const REGISTRANT_SQL = `
  SELECT t.id AS ticket_id, t.reference, t.payer_name, t.payer_email, t.quantity, t.amount, t.currency,
         t.status, t.checked_in, t.checked_in_at, t.created_at,
         p.id AS person_id, p.first_name, p.last_name, p.phone
  FROM public.event_tickets t
  JOIN public.people p ON p.id = t.person_id
  WHERE t.event_id = $1
  ORDER BY t.created_at DESC
`;

function toRegistrant(r: {
  ticket_id: string;
  reference: string;
  payer_name: string;
  payer_email: string;
  quantity: number;
  amount: number;
  currency: string;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  person_id: string;
  first_name: string;
  last_name: string;
  phone: string;
}): EventRegistrant {
  return {
    ticketId: r.ticket_id,
    reference: r.reference,
    payerName: r.payer_name,
    payerEmail: r.payer_email,
    quantity: Number(r.quantity),
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    checkedIn: Boolean(r.checked_in),
    checkedInAt: r.checked_in_at,
    createdAt: r.created_at,
    personId: r.person_id,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
  };
}

export async function getEventAdminDetail(eventId: string): Promise<EventAdminDetail | null> {
  await requirePermission("manage_events");
  const event = await eventById(eventId);
  if (!event) return null;
  const [counts, registrants] = await Promise.all([
    db.query<{ status: string; count: string }>(
      "SELECT status, COUNT(*)::int AS count FROM public.event_tickets WHERE event_id = $1 GROUP BY status",
      [eventId]
    ),
    db.query<Record<string, unknown> & {
      ticket_id: string;
      reference: string;
      payer_name: string;
      payer_email: string;
      quantity: number;
      amount: number;
      currency: string;
      status: string;
      checked_in: boolean;
      checked_in_at: string | null;
      created_at: string;
      person_id: string;
      first_name: string;
      last_name: string;
      phone: string;
    }>(REGISTRANT_SQL, [eventId]),
  ]);
  const byStatus: Record<string, number> = {};
  for (const c of counts) byStatus[c.status] = Number(c.count ?? 0);
  const confirmed = byStatus["confirmed"] || 0;
  const revenue = registrants
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + Number(r.amount) * Number(r.quantity), 0);
  return {
    event: {
      id: event.id,
      title: event.title,
      date: event.date,
      venue: event.venue,
      time: event.time,
      category: event.category,
      is_paid: Boolean(event.is_paid),
      price: Number(event.price),
      capacity: Number(event.capacity),
      capacity_used: Number(event.capacity_used),
      registration_deadline: event.registration_deadline,
      max_per_person: Number(event.max_per_person),
      allow_public_registration: Boolean(event.allow_public_registration),
      reminders_enabled: Boolean(event.reminders_enabled),
      status: event.status,
      registrations: registrants.length,
      confirmed,
      checkedIn: registrants.filter((r) => Boolean(r.checked_in)).length,
      revenue,
    },
    registrants: registrants.map(toRegistrant),
  };
}

export async function listRegistrants(eventId: string): Promise<EventRegistrant[]> {
  await requirePermission("manage_events");
  const rows = await db.query<Record<string, unknown> & {
    ticket_id: string;
    reference: string;
    payer_name: string;
    payer_email: string;
    quantity: number;
    amount: number;
    currency: string;
    status: string;
    checked_in: boolean;
    checked_in_at: string | null;
    created_at: string;
    person_id: string;
    first_name: string;
    last_name: string;
    phone: string;
  }>(REGISTRANT_SQL, [eventId]);
  return rows.map(toRegistrant);
}

export async function exportEventRegistrants(eventId: string): Promise<EventRegistrant[]> {
  await requirePermission("export_data");
  return listRegistrants(eventId);
}

export async function setCapacityUsedOverride(eventId: string, n: number): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_events");
  const safe = Math.max(0, Number(n) || 0);
  const event = await eventById(eventId);
  if (!event) return { error: "Event not found" };
  await db.query("UPDATE public.events SET capacity_used = $2, updated_at = now() WHERE id = $1", [eventId, safe]);
  logActivity(admin.email, "event_update", "events", {
    resourceId: eventId,
    details: `Capacity used override set to ${safe} for "${event.title}"`,
  });
  return {};
}

export async function sendEventReminders(eventId: string): Promise<{ sent: number; error?: string }> {
  const admin = await requirePermission("manage_events");
  const event = await eventById(eventId);
  if (!event) return { sent: 0, error: "Event not found" };
  const tickets = await db.query<EventTicketRow>(
    "SELECT * FROM public.event_tickets WHERE event_id = $1 AND status = 'confirmed'",
    [eventId]
  );
  let sent = 0;
  for (const t of tickets) {
    if (!t.payer_email) continue;
    const res = await sendEventReminderEmail({
      email: t.payer_email,
      firstName: t.payer_name.split(" ")[0] || "",
      eventName: event.title,
      eventDate: event.date,
      eventLocation: event.venue,
      passUrl: t.qr_token ? passUrlFor(t.qr_token) : "",
    });
    if (!res.error) sent++;
  }
  logActivity(admin.email, "event_reminders", "events", {
    resourceId: eventId,
    details: `Sent ${sent}/${tickets.length} reminders for "${event.title}"`,
  });
  return { sent };
}

export async function registerForEvent(opts: {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  consent?: boolean;
}): Promise<{ error?: string; passUrl?: string; reference?: string }> {
  if (!opts.consent) return { error: "Consent is required to register." };
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  const event = await eventById(opts.eventId);
  if (!event) return { error: "Event not found" };
  if (event.status !== "published") return { error: "This event is not open for registration." };

  const used = await reserveCapacity(opts.eventId, 1);
  if (used === null) return { error: "This event is sold out" };

  try {
    const person = await findOrCreatePerson({ firstName: opts.name, email: opts.email, phone: opts.phone });
    if (!person) {
      await releaseCapacity(opts.eventId, 1);
      return { error: "Something went wrong. Try again." };
    }
    await ensurePersonRoles(person.id, ["attendee"]);
    await upsertPersonRecord(person.id, "event_registration", {
      refId: opts.eventId,
      refTitle: event.title,
      status: "confirmed",
    });
    const ticket = await createTicket({
      eventId: opts.eventId,
      personId: person.id,
      payerName: opts.name,
      payerEmail: opts.email,
      quantity: 1,
      status: "confirmed",
    });
    if (!ticket) {
      await releaseCapacity(opts.eventId, 1);
      return { error: "Something went wrong. Try again." };
    }
    await createWorkflowRecord({
      kind: "event_registration",
      refId: ticket.id,
      title: `Event registration: ${event.title}`,
      summary: `${opts.name} registered for ${event.title}`,
      status: "resolved",
      submitterName: opts.name,
      submitterEmail: opts.email,
      source: "event",
      details: { eventId: opts.eventId, reference: ticket.reference, free: true },
      outcome: "Free registration confirmed, pass issued",
    });
    const passUrl = passUrlFor(ticket.qr_token);
    await sendRegistrationConfirmedEmail({
      email: opts.email,
      firstName: opts.name.split(" ")[0] || "",
      eventName: event.title,
      eventDate: event.date,
      eventLocation: event.venue,
      passUrl,
    });
    return { passUrl, reference: ticket.reference };
  } catch (err) {
    await releaseCapacity(opts.eventId, 1);
    console.error("registerForEvent error:", err);
    return { error: "Something went wrong. Try again." };
  }
}

export async function setEventCheckedIn(ticketId: string, checkedIn: boolean): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_events");
  const rows = await db.query<EventTicketRow>(
    `UPDATE public.event_tickets
        SET checked_in = $2, checked_in_at = CASE WHEN $2 THEN now() ELSE NULL END, updated_at = now()
      WHERE id = $1 RETURNING *`,
    [ticketId, checkedIn]
  );
  if (!rows.length) return { error: "Ticket not found" };
  logActivity(admin.email, checkedIn ? "check_in" : "check_in_undo", "event_tickets", {
    resourceId: ticketId,
    details: `${checkedIn ? "Checked in" : "Undid check-in for"} ticket ${rows[0].reference}`,
  });
  return {};
}

export async function checkInAttendee(input: {
  token?: string;
  reference?: string;
  email?: string;
}): Promise<{ error?: string; result?: Awaited<ReturnType<typeof checkInTicket>> }> {
  const admin = await requirePermission("check_in_attendees");
  const result = await checkInTicket(input);
  if (result.checkedIn || result.alreadyCheckedIn) {
    logActivity(admin.email, "check_in", "event_tickets", {
      resourceId: input.token || input.reference || input.email || "",
      details: result.checkedIn
        ? `Checked in ${result.attendeeName}`
        : `Already checked in ${result.attendeeName} (second scan)`,
    });
  }
  return { result };
}

export async function createTicketNotification(eventId: string, reference: string) {
  const event = await eventById(eventId);
  await createAdminNotification({
    title: "Paid ticket confirmed",
    message: `${reference} confirmed for ${event?.title || "event"}`,
    type: "ticket",
    link: "/admin/events",
  });
}
