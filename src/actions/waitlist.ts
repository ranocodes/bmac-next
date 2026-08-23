"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { findOrCreatePerson, ensurePersonRoles, upsertPersonRecord } from "@/lib/people";
import { createTicket, reserveCapacity, passUrlFor } from "@/lib/tickets";
import { sendRegistrationConfirmedEmail, sendRegistrationAlertEmail } from "@/lib/email";
import { createAdminNotification, emailSuperAdmins } from "@/lib/notifications";
import { requirePermission } from "@/lib/auth/server";

export interface WaitlistEntry {
  id: string;
  eventId: string;
  personId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  promotedAt: string | null;
}

export async function joinWaitlist(opts: {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<{ error?: string; entry?: WaitlistEntry }> {
  if (!opts.eventId) return { error: "Missing event" };
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  const person = await findOrCreatePerson({
    firstName: opts.name,
    email: opts.email,
    phone: opts.phone,
  });
  if (!person) return { error: "Something went wrong. Try again." };

  const existing = await db.query<{ id: string }>(
    `SELECT id FROM public.event_waitlist
     WHERE event_id = $1 AND LOWER(email) = LOWER($2) AND status = 'waiting'
     LIMIT 1`,
    [opts.eventId, opts.email]
  );
  if (existing.length) {
    return { error: "You're already on the waitlist for this event." };
  }

  const rows = await db.query<WaitlistEntry>(
    `INSERT INTO public.event_waitlist (id, event_id, person_id, name, email, phone, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'waiting')
     RETURNING id, event_id AS "eventId", person_id AS "personId", name, email, phone, status, created_at AS "createdAt", promoted_at AS "promotedAt"`,
    [`wl-${crypto.randomUUID()}`, opts.eventId, person.id, opts.name, opts.email, opts.phone || ""]
  );
  return { entry: rows[0] };
}

export async function promoteFromWaitlist(eventId: string, n = 1): Promise<{ promoted: number; error?: string }> {
  await requirePermission("manage_events");
  const next = await db.query<WaitlistEntry>(
    `SELECT id, event_id AS "eventId", person_id AS "personId", name, email, phone, status, created_at AS "createdAt", promoted_at AS "promotedAt"
     FROM public.event_waitlist
     WHERE event_id = $1 AND status = 'waiting'
     ORDER BY created_at ASC
     LIMIT $2`,
    [eventId, n]
  );
  if (!next.length) return { promoted: 0 };

  let promoted = 0;
  for (const wl of next) {
    const used = await reserveCapacity(eventId, 1);
    if (used === null) break; // no room left

    try {
      const event = await db.query<{ title: string; date: string; venue: string }>(
        "SELECT title, date, venue FROM public.events WHERE id = $1",
        [eventId]
      );
      const title = event[0]?.title || "Event";
      const ticket = await createTicket({
        eventId,
        personId: wl.personId,
        payerName: wl.name,
        payerEmail: wl.email,
        quantity: 1,
        status: "confirmed",
      });
      if (!ticket) {
        await db.query(
          "UPDATE public.events SET capacity_used = GREATEST(0, capacity_used - 1), updated_at = now() WHERE id = $1",
          [eventId]
        );
        break;
      }
      await ensurePersonRoles(wl.personId, ["attendee"]);
      await upsertPersonRecord(wl.personId, "event_registration", {
        refId: eventId,
        refTitle: title,
        status: "confirmed",
      });
      await db.query(
        `UPDATE public.event_waitlist
         SET status = 'promoted', promoted_at = now()
         WHERE id = $1 AND status = 'waiting'`,
        [wl.id]
      );
      await sendRegistrationConfirmedEmail({
        email: wl.email,
        firstName: wl.name.split(" ")[0] || "",
        eventName: title,
        eventDate: event[0]?.date || "",
        eventLocation: event[0]?.venue || "",
        passUrl: passUrlFor(ticket.qr_token),
      });
      await createAdminNotification({
        title: "Waitlist promotion",
        message: `${wl.name} promoted from waitlist to ${title} (${ticket.reference}).`,
        type: "registration",
        link: "/admin/events",
      });
      await emailSuperAdmins(adminEmail =>
        sendRegistrationAlertEmail({
          email: adminEmail,
          attendeeName: wl.name,
          attendeeEmail: wl.email,
          eventName: title,
        })
      );
      promoted++;
    } catch (err) {
      console.error("promoteFromWaitlist error:", err);
      break;
    }
  }
  return { promoted };
}

export async function removeFromWaitlist(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("manage_events");
  const rows = await db.query<{ id: string }>(
    `DELETE FROM public.event_waitlist WHERE id = $1 AND status = 'waiting' RETURNING id`,
    [id]
  );
  if (!rows.length) return { success: false, error: "Entry not found or already promoted" };
  return { success: true };
}

export async function listWaitlist(eventId: string): Promise<WaitlistEntry[]> {
  await requirePermission("manage_events");
  const rows = await db.query<WaitlistEntry>(
    `SELECT id, event_id AS "eventId", person_id AS "personId", name, email, phone, status, created_at AS "createdAt", promoted_at AS "promotedAt"
     FROM public.event_waitlist
     WHERE event_id = $1
     ORDER BY created_at ASC`,
    [eventId]
  );
  return rows;
}
