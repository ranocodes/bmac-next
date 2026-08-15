import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEventReminderEmail } from '@/lib/email';
import { sendEventReminderSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

function authorized(request: Request): boolean {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("authorization")?.replace(/^Bearer /, "");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && token && token === secret);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const events = await db.query<{
    id: string;
    title: string;
    date: string;
    venue: string;
    last_reminder_sent_at: string | null;
  }>(
    `SELECT id, title, date, venue, last_reminder_sent_at
     FROM public.events
     WHERE reminders_enabled = TRUE
       AND status = 'published'
       AND date > $1 AND date <= $2
       AND (last_reminder_sent_at IS NULL OR last_reminder_sent_at < now() - interval '23 hours')`,
    [now.toISOString(), windowEnd.toISOString()]
  );

  const report: Array<{ event: string; sent: number; sms: number; errors: number }> = [];

  for (const event of events) {
    const tickets = await db.query<{
      payer_email: string;
      payer_name: string;
      qr_token: string;
      phone: string;
    }>(
      `SELECT t.payer_email, t.payer_name, t.qr_token, COALESCE(p.phone, '') AS phone
       FROM public.event_tickets t
       LEFT JOIN public.people p ON p.id = t.person_id
       WHERE t.event_id = $1 AND t.status = 'confirmed'`,
      [event.id]
    );

    let sent = 0;
    let sms = 0;
    let errors = 0;
    for (const t of tickets) {
      if (!t.payer_email) continue;
      const emailRes = await sendEventReminderEmail({
        email: t.payer_email,
        firstName: t.payer_name.split(" ")[0] || "",
        eventName: event.title,
        eventDate: event.date,
        eventLocation: event.venue,
        passUrl: t.qr_token ? `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || ""}/pass/${t.qr_token}` : "",
      });
      if (emailRes.error) {
        errors++;
      } else {
        sent++;
      }
      if (t.phone) {
        const smsRes = await sendEventReminderSms({
          phone: t.phone,
          firstName: t.payer_name.split(" ")[0] || "",
          eventName: event.title,
          eventDate: event.date,
          eventLocation: event.venue,
        });
        if (!smsRes.error) sms++;
      }
    }

    await db.query(
      "UPDATE public.events SET last_reminder_sent_at = now(), updated_at = now() WHERE id = $1",
      [event.id]
    );
    report.push({ event: event.title, sent, sms, errors });
  }

  return NextResponse.json({ ok: true, processed: report });
}
