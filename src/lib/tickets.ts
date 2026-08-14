import crypto from "crypto";
import { db } from "@/lib/db";

export interface EventTicketRow {
  id: string;
  event_id: string;
  person_id: string;
  reference: string;
  qr_token: string;
  payer_name: string;
  payer_email: string;
  quantity: number;
  amount: number;
  currency: string;
  status: string;
  checked_in: boolean;
  checked_in_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function genReference(): string {
  return `BMAC-EVT-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function genQrToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function passUrlFor(token: string): string {
  return `/pass/${token}`;
}

export interface CreateTicketInput {
  eventId: string;
  personId: string;
  payerName: string;
  payerEmail: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  status?: string;
}

export async function createTicket(input: CreateTicketInput): Promise<EventTicketRow | null> {
  const reference = genReference();
  const qrToken = genQrToken();
  const rows = await db.query<EventTicketRow>(
    `INSERT INTO public.event_tickets
       (id, event_id, person_id, reference, qr_token, payer_name, payer_email, quantity, amount, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      `ticket-${crypto.randomUUID()}`,
      input.eventId,
      input.personId,
      reference,
      qrToken,
      input.payerName || "",
      input.payerEmail || "",
      input.quantity || 1,
      input.amount || 0,
      input.currency || "NGN",
      input.status || "pending",
    ]
  );
  return rows.length ? rows[0] : null;
}

export async function getEventRow(eventId: string): Promise<{
  id: string;
  title: string;
  date: string;
  venue: string;
  capacity: number;
  capacity_used: number;
  is_paid: boolean;
  price: number;
} | null> {
  const rows = await db.query<{
    id: string;
    title: string;
    date: string;
    venue: string;
    capacity: number;
    capacity_used: number;
    is_paid: boolean;
    price: number;
  }>(
    `SELECT id, title, date, venue, capacity, capacity_used, is_paid, price
     FROM public.events WHERE id = $1`,
    [eventId]
  );
  return rows.length ? rows[0] : null;
}

export async function reserveCapacity(eventId: string, n: number): Promise<number | null> {
  const rows = await db.query<{ capacity_used: number }>(
    `UPDATE public.events
        SET capacity_used = capacity_used + $2, updated_at = now()
      WHERE id = $1
        AND (capacity = 0 OR capacity_used + $2 <= capacity)
      RETURNING capacity_used`,
    [eventId, n]
  );
  return rows.length ? rows[0].capacity_used : null;
}

export async function releaseCapacity(eventId: string, n: number): Promise<void> {
  await db.query(
    `UPDATE public.events
        SET capacity_used = GREATEST(0, capacity_used - $2), updated_at = now()
      WHERE id = $1`,
    [eventId, n]
  );
}

export async function getTicketByToken(token: string): Promise<EventTicketRow | null> {
  const rows = await db.query<EventTicketRow>(
    "SELECT * FROM public.event_tickets WHERE qr_token = $1",
    [token]
  );
  return rows.length ? rows[0] : null;
}

export async function getTicketByReference(reference: string): Promise<EventTicketRow | null> {
  const rows = await db.query<EventTicketRow>(
    "SELECT * FROM public.event_tickets WHERE reference = $1",
    [reference]
  );
  return rows.length ? rows[0] : null;
}

export async function getTicketById(ticketId: string): Promise<EventTicketRow | null> {
  return db.getById<EventTicketRow>("event_tickets", ticketId);
}

export async function checkInTicket(input: {
  token?: string;
  reference?: string;
  email?: string;
}): Promise<{
  checkedIn?: boolean;
  alreadyCheckedIn?: boolean;
  notFound?: boolean;
  notConfirmed?: boolean;
  checkedInAt?: string;
  attendeeName?: string;
  eventTitle?: string;
}> {
  let ticket: EventTicketRow | null = null;
  if (input.token) {
    ticket = await getTicketByToken(input.token);
  } else if (input.reference) {
    ticket = await getTicketByReference(input.reference);
  } else if (input.email) {
    const rows = await db.query<EventTicketRow>(
      `SELECT * FROM public.event_tickets
       WHERE LOWER(payer_email) = LOWER($1) AND status = 'confirmed'
       ORDER BY created_at DESC LIMIT 1`,
      [input.email]
    );
    ticket = rows.length ? rows[0] : null;
  }

  if (!ticket) return { notFound: true };
  if (ticket.status !== "confirmed") return { notConfirmed: true };

  const eventRows = await db.query<{ title: string }>(
    "SELECT title FROM public.events WHERE id = $1",
    [ticket.event_id]
  );
  const eventTitle = eventRows[0]?.title || "";
  const attendeeName = ticket.payer_name || ticket.payer_email || "";

  if (ticket.checked_in) {
    return { alreadyCheckedIn: true, checkedInAt: ticket.checked_in_at || undefined, attendeeName, eventTitle };
  }

  const updated = await db.query<EventTicketRow>(
    `UPDATE public.event_tickets
        SET checked_in = TRUE, checked_in_at = now(), updated_at = now()
      WHERE id = $1 AND checked_in = FALSE
      RETURNING *`,
    [ticket.id]
  );
  if (!updated.length) {
    return { alreadyCheckedIn: true, checkedInAt: ticket.checked_in_at || undefined, attendeeName, eventTitle };
  }
  return { checkedIn: true, checkedInAt: updated[0].checked_in_at || undefined, attendeeName, eventTitle };
}
