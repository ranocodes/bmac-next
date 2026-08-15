"use server";

import { db } from "@/lib/db";
import { logActivity } from "./activity-logs";
import { requirePermission } from "@/lib/auth/server";
import { sendNewsletterBroadcastEmail } from "@/lib/email";

export interface NewsletterSubscriber {
  email: string;
  source: string;
  active: boolean;
  createdAt: string;
  lastSentAt: string | null;
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  await requirePermission("manage_newsletter");
  const rows = await db.query<{
    email: string;
    source: string;
    active: boolean;
    created_at: string;
    last_sent_at: string | null;
  }>(
    `SELECT email, source, active, created_at, last_sent_at
     FROM public.newsletter_subscribers
     WHERE active = TRUE
     ORDER BY created_at DESC`
  );
  return rows.map(r => ({
    email: r.email,
    source: r.source || "newsletter_modal",
    active: Boolean(r.active),
    createdAt: r.created_at,
    lastSentAt: r.last_sent_at,
  }));
}

export async function sendNewsletterBroadcast(opts: {
  subject: string;
  body: string;
  limit?: number;
}): Promise<{ sent: number; errors: number; error?: string }> {
  const admin = await requirePermission("manage_newsletter");
  const subject = (opts.subject || "").trim();
  const body = (opts.body || "").trim();
  if (!subject || !body) return { sent: 0, errors: 0, error: "Subject and body are required" };

  const limit = Math.min(Math.max(Number(opts.limit) || 0, 0), 500);
  const rows = await db.query<{ email: string; first_name: string }>(
    `SELECT s.email, COALESCE(p.first_name, '') AS first_name
     FROM public.newsletter_subscribers s
     LEFT JOIN public.people p ON LOWER(p.email) = LOWER(s.email)
     WHERE s.active = TRUE AND s.unsubscribed_at IS NULL
     ORDER BY s.created_at DESC
     ${limit > 0 ? "LIMIT $1" : ""}`,
    limit > 0 ? [limit] : []
  );

  let sent = 0;
  let errors = 0;
  for (const r of rows) {
    const res = await sendNewsletterBroadcastEmail({
      email: r.email,
      firstName: r.first_name,
      subject,
      body,
      unsubscribeUrl: `/api/newsletter/unsubscribe?email=${encodeURIComponent(r.email)}`,
    });
    if (res.error) {
      errors++;
      console.error("newsletter-broadcast error:", r.email, res.error);
    } else {
      sent++;
    }
    await db.query(
      "UPDATE public.newsletter_subscribers SET last_sent_at = now() WHERE LOWER(email) = LOWER($1)",
      [r.email]
    );
  }

  logActivity(admin.email, "newsletter_broadcast", "newsletter", {
    details: `Sent ${sent}/${rows.length} newsletters "${subject}" (${errors} errors)`,
  });
  return { sent, errors };
}

export async function unsubscribeNewsletter(email: string): Promise<{ error?: string }> {
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { error: "Invalid email" };
  }
  await db.query(
    `UPDATE public.newsletter_subscribers
     SET active = FALSE, unsubscribed_at = now()
     WHERE LOWER(email) = LOWER($1)`,
    [clean]
  );
  return {};
}
