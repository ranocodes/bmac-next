import { db } from "@/lib/db";
import { sendNewsletterBroadcastEmail } from "@/lib/email";
import { markdownToHtml } from "@/lib/markdown";
import { logActivity } from "@/lib/activity-log";

export type BroadcastStatus = "scheduled" | "sending" | "sent" | "partial" | "aborted" | "test";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendToRows(
  rows: { email: string; first_name: string }[],
  subject: string,
  bodyHtml: string,
  bodyMd: string,
  unsubscribeBase: string
): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const res = await sendNewsletterBroadcastEmail({
      email: r.email,
      firstName: r.first_name,
      subject,
      body: bodyHtml,
      unsubscribeUrl: `${unsubscribeBase}?email=${encodeURIComponent(r.email)}`,
    });
    if (res.error) {
      errors++;
      console.error("newsletter-broadcast error:", r.email, res.error);
      await db.query(
        "UPDATE public.newsletter_subscribers SET last_error_at = now() WHERE LOWER(email) = LOWER($1)",
        [r.email]
      );
    } else {
      sent++;
      await db.query(
        "UPDATE public.newsletter_subscribers SET last_sent_at = now() WHERE LOWER(email) = LOWER($1)",
        [r.email]
      );
    }
    if (i < rows.length - 1) await sleep(75);
  }
  return { sent, errors };
}

export async function upsertBroadcastLog(opts: {
  id: string;
  subject: string;
  bodyMd: string;
  bodyHtml: string;
  audienceSource?: string;
  recipientCount: number;
  sentCount: number;
  errorCount: number;
  status: BroadcastStatus;
  createdBy: string;
}): Promise<void> {
  await db.query(
    `INSERT INTO public.broadcast_log
       (id, subject, body_md, body_html, audience_source, recipient_count, sent_count, error_count, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET
       recipient_count = EXCLUDED.recipient_count,
       sent_count = public.broadcast_log.sent_count + EXCLUDED.sent_count,
       error_count = public.broadcast_log.error_count + EXCLUDED.error_count,
       status = EXCLUDED.status,
       updated_at = now()`,
    [
      opts.id,
      opts.subject,
      opts.bodyMd,
      opts.bodyHtml,
      opts.audienceSource || null,
      opts.recipientCount,
      opts.sentCount,
      opts.errorCount,
      opts.status,
      opts.createdBy,
    ]
  );
}

export async function performChunk(
  adminEmail: string,
  opts: {
    subject: string;
    bodyMd: string;
    bodyHtml: string;
    offset: number;
    limit: number;
    audienceSource?: string;
    campaignId: string;
  }
): Promise<{ sent: number; errors: number; total: number; done: boolean }> {
  const subject = opts.subject.trim();
  if (!subject || !opts.bodyMd.trim()) {
    return { sent: 0, errors: 0, total: 0, done: true };
  }

  let where = "WHERE s.active = TRUE AND s.unsubscribed_at IS NULL";
  const countParams: unknown[] = [];
  if (opts.audienceSource) {
    where += " AND s.source = $1";
    countParams.push(opts.audienceSource);
  }

  const countRes = await db.query<{ count: string }>(
    `SELECT COUNT(*) FROM public.newsletter_subscribers s ${where}`,
    countParams
  );
  const total = parseInt(countRes[0]?.count || "0", 10);

  const rows = await db.query<{ email: string; first_name: string }>(
    `SELECT s.email, COALESCE(p.first_name, '') AS first_name
     FROM public.newsletter_subscribers s
     LEFT JOIN public.people p ON LOWER(p.email) = LOWER(s.email)
     ${where}
     ORDER BY s.created_at DESC
     LIMIT $${opts.audienceSource ? 2 : 1} OFFSET $${opts.audienceSource ? 3 : 2}`,
    [
      ...(opts.audienceSource ? [opts.audienceSource] : []),
      opts.limit,
      opts.offset,
    ]
  );

  const unsubscribeBase = "/api/newsletter/unsubscribe";
  const { sent, errors } = await sendToRows(rows, subject, opts.bodyHtml, opts.bodyMd, unsubscribeBase);

  const done = opts.offset + opts.limit >= total;
  const status: BroadcastStatus = done ? (errors > 0 ? "partial" : "sent") : "sending";

  await upsertBroadcastLog({
    id: opts.campaignId,
    subject,
    bodyMd: opts.bodyMd,
    bodyHtml: opts.bodyHtml,
    audienceSource: opts.audienceSource,
    recipientCount: total,
    sentCount: sent,
    errorCount: errors,
    status,
    createdBy: adminEmail,
  });

  if (done) {
    logActivity(adminEmail, "newsletter_broadcast", "newsletter", {
      details: `Sent ${sent}/${total} newsletters "${subject}" (${errors} errors) [${opts.campaignId}]`,
    });
  }

  return { sent, errors, total, done };
}

export async function flushScheduledBroadcasts(): Promise<{
  due: number;
  sent: number;
  errors: number;
}> {
  const dueRows = await db.query<{ id: string; subject: string; body_md: string; body_html: string; audience_source: string | null }>(
    `SELECT id, subject, body_md, body_html, audience_source
     FROM public.broadcast_log
     WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now()
     FOR UPDATE SKIP LOCKED
     LIMIT 5`
  );

  if (dueRows.length === 0) return { due: 0, sent: 0, errors: 0 };

  let totalSent = 0;
  let totalErrors = 0;

  for (const row of dueRows) {
    await db.query(
      `UPDATE public.broadcast_log SET status = 'sending', updated_at = now() WHERE id = $1`,
      [row.id]
    );

    const CHUNK_SIZE = 100;
    let offset = 0;
    let done = false;

    while (!done) {
      const result = await performChunk("system@bmac", {
        subject: row.subject,
        bodyMd: row.body_md,
        bodyHtml: row.body_html || markdownToHtml(row.body_md),
        offset,
        limit: CHUNK_SIZE,
        audienceSource: row.audience_source || undefined,
        campaignId: row.id,
      });
      totalSent += result.sent;
      totalErrors += result.errors;
      done = result.done;
      offset += CHUNK_SIZE;
    }
  }

  return { due: dueRows.length, sent: totalSent, errors: totalErrors };
}
