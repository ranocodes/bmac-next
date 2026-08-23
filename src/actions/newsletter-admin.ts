"use server";

import { db } from "@/lib/db";
import { logActivity } from "./activity-logs";
import { requirePermission } from "@/lib/auth/server";
import { sendNewsletterBroadcastEmail } from "@/lib/email";
import { markdownToHtml } from "@/lib/markdown";

export interface NewsletterSubscriber {
  email: string;
  source: string;
  active: boolean;
  createdAt: string;
  lastSentAt: string | null;
}

export interface NewsletterSubscribersPage {
  rows: NewsletterSubscriber[];
  total: number;
}

export type BroadcastStatus = "scheduled" | "sending" | "sent" | "partial" | "aborted" | "test";

export interface Broadcast {
  id: string;
  subject: string;
  status: BroadcastStatus;
  audienceSource: string | null;
  recipientCount: number;
  sentCount: number;
  errorCount: number;
  scheduledFor: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterTemplate {
  name: string;
  subject: string;
  bodyMd: string;
  updatedAt: string;
}

export async function listNewsletterSubscribers(opts?: {
  limit?: number;
  offset?: number;
  source?: string;
  search?: string;
}): Promise<NewsletterSubscribersPage> {
  await requirePermission("manage_newsletter");
  const limit = Math.min(Math.max(Number(opts?.limit) || 50, 1), 200);
  const offset = Math.max(Number(opts?.offset) || 0, 0);
  const source = (opts?.source || "").trim();
  const search = (opts?.search || "").trim().toLowerCase();

  let where = "WHERE active = TRUE";
  const params: unknown[] = [];
  let idx = 1;

  if (source) {
    where += ` AND source = $${idx++}`;
    params.push(source);
  }
  if (search) {
    where += ` AND LOWER(email) LIKE $${idx++}`;
    params.push(`%${search}%`);
  }

  const countRes = await db.query<{ count: string }>(
    `SELECT COUNT(*) FROM public.newsletter_subscribers ${where}`,
    params
  );
  const total = parseInt(countRes[0]?.count || "0", 10);

  const rows = await db.query<{
    email: string;
    source: string;
    active: boolean;
    created_at: string;
    last_sent_at: string | null;
  }>(
    `SELECT email, source, active, created_at, last_sent_at
     FROM public.newsletter_subscribers
     ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );

  return {
    total,
    rows: rows.map((r) => ({
      email: r.email,
      source: r.source || "newsletter_modal",
      active: Boolean(r.active),
      createdAt: r.created_at,
      lastSentAt: r.last_sent_at,
    })),
  };
}

export async function listNewsletterSources(): Promise<string[]> {
  await requirePermission("manage_newsletter");
  const rows = await db.query<{ source: string }>(
    `SELECT DISTINCT source FROM public.newsletter_subscribers WHERE source IS NOT NULL ORDER BY source`
  );
  return rows.map((r) => r.source);
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export async function performChunk(opts: {
  subject: string;
  bodyMd: string;
  bodyHtml: string;
  offset: number;
  limit: number;
  audienceSource?: string;
  campaignId: string;
}): Promise<{ sent: number; errors: number; total: number; done: boolean }> {
  const admin = await requirePermission("manage_newsletter");
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
    createdBy: admin.email,
  });

  if (done) {
    logActivity(admin.email, "newsletter_broadcast", "newsletter", {
      details: `Sent ${sent}/${total} newsletters "${subject}" (${errors} errors) [${opts.campaignId}]`,
    });
  }

  return { sent, errors, total, done };
}

export async function sendNewsletterBroadcast(opts: {
  subject: string;
  body: string;
  bodyHtml?: string;
  offset?: number;
  limit?: number;
  audienceSource?: string;
  campaignId?: string;
}): Promise<{
  sent: number;
  errors: number;
  total: number;
  done: boolean;
  campaignId: string;
  error?: string;
}> {
  const subject = (opts.subject || "").trim();
  const body = (opts.body || "").trim();
  if (!subject || !body) {
    return { sent: 0, errors: 0, total: 0, done: true, campaignId: "", error: "Subject and body are required" };
  }

  const campaignId = opts.campaignId || `bc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const bodyHtml = opts.bodyHtml || markdownToHtml(body);
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 200);
  const offset = Math.max(Number(opts.offset) || 0, 0);

  const result = await performChunk({
    subject,
    bodyMd: body,
    bodyHtml,
    offset,
    limit,
    audienceSource: opts.audienceSource,
    campaignId,
  });

  return { ...result, campaignId };
}

export async function sendNewsletterTest(opts: {
  subject: string;
  body: string;
  bodyHtml?: string;
  to: string;
}): Promise<{ sent: number; errors: number; error?: string }> {
  const admin = await requirePermission("manage_newsletter");
  const subject = (opts.subject || "").trim();
  const body = (opts.body || "").trim();
  if (!subject || !body) {
    return { sent: 0, errors: 0, error: "Subject and body are required" };
  }

  const emails = (opts.to || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const valid = emails.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (valid.length === 0) {
    return { sent: 0, errors: 0, error: "No valid email addresses provided (invalid format)" };
  }

  const bodyHtml = opts.bodyHtml || markdownToHtml(body);
  const unsubscribeBase = "/api/newsletter/unsubscribe";
  let sent = 0;
  let errors = 0;

  for (const email of valid) {
    const res = await sendNewsletterBroadcastEmail({
      email,
      subject: `[TEST] ${subject}`,
      body: bodyHtml,
      unsubscribeUrl: `${unsubscribeBase}?email=${encodeURIComponent(email)}`,
    });
    if (res.error) {
      errors++;
    } else {
      sent++;
    }
  }

  const campaignId = `test-${Date.now().toString(36)}`;

  await db.query(
    `INSERT INTO public.broadcast_log (id, subject, body_md, body_html, recipient_count, sent_count, error_count, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [campaignId, `[TEST] ${subject}`, body, bodyHtml, valid.length, sent, errors, "test", admin.email]
  );

  logActivity(admin.email, "newsletter_test", "newsletter", {
    details: `Test send "${subject}" to ${valid.length} address(es) (${sent} sent, ${errors} errors)`,
  });

  return { sent, errors };
}

export async function cancelNewsletterBroadcast(campaignId: string): Promise<{ error?: string }> {
  await requirePermission("manage_newsletter");
  if (!campaignId) return { error: "Campaign ID required" };
  await db.query(
    `UPDATE public.broadcast_log SET status = 'aborted', updated_at = now() WHERE id = $1 AND status IN ('scheduled', 'sending')`,
    [campaignId]
  );
  return {};
}

export async function listBroadcastHistory(): Promise<Broadcast[]> {
  await requirePermission("manage_newsletter");
  const rows = await db.query<{
    id: string;
    subject: string;
    status: string;
    audience_source: string | null;
    recipient_count: string;
    sent_count: string;
    error_count: string;
    scheduled_for: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, subject, status, audience_source, recipient_count, sent_count, error_count,
            scheduled_for, created_by, created_at, updated_at
     FROM public.broadcast_log
     ORDER BY created_at DESC
     LIMIT 50`
  );
  return rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    status: r.status as BroadcastStatus,
    audienceSource: r.audience_source,
    recipientCount: parseInt(r.recipient_count, 10),
    sentCount: parseInt(r.sent_count, 10),
    errorCount: parseInt(r.error_count, 10),
    scheduledFor: r.scheduled_for,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function saveNewsletterTemplate(opts: {
  name: string;
  subject: string;
  body: string;
}): Promise<{ error?: string }> {
  await requirePermission("manage_newsletter");
  const name = (opts.name || "").trim();
  if (!name) return { error: "Template name required" };
  await db.query(
    `INSERT INTO public.newsletter_templates (name, subject, body_md, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (name) DO UPDATE SET subject = EXCLUDED.subject, body_md = EXCLUDED.body_md, updated_at = now()`,
    [name, opts.subject || "", opts.body || ""]
  );
  return {};
}

export async function deleteNewsletterTemplate(name: string): Promise<{ error?: string }> {
  await requirePermission("manage_newsletter");
  if (!name) return { error: "Template name required" };
  await db.query(`DELETE FROM public.newsletter_templates WHERE name = $1`, [name]);
  return {};
}

export async function listNewsletterTemplates(): Promise<NewsletterTemplate[]> {
  await requirePermission("manage_newsletter");
  const rows = await db.query<{ name: string; subject: string; body_md: string; updated_at: string }>(
    `SELECT name, subject, body_md, updated_at FROM public.newsletter_templates ORDER BY name`
  );
  return rows.map((r) => ({
    name: r.name,
    subject: r.subject,
    bodyMd: r.body_md,
    updatedAt: r.updated_at,
  }));
}

export async function scheduleNewsletterBroadcast(opts: {
  subject: string;
  body: string;
  bodyHtml?: string;
  scheduledFor: string;
  audienceSource?: string;
}): Promise<{ campaignId?: string; error?: string }> {
  const admin = await requirePermission("manage_newsletter");
  const subject = (opts.subject || "").trim();
  const body = (opts.body || "").trim();
  if (!subject || !body) return { error: "Subject and body required" };

  const scheduledDate = new Date(opts.scheduledFor);
  if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    return { error: "Scheduled time must be in the future" };
  }

  const campaignId = `bc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const bodyHtml = opts.bodyHtml || markdownToHtml(body);

  await db.query(
    `INSERT INTO public.broadcast_log
       (id, subject, body_md, body_html, audience_source, status, scheduled_for, created_by)
     VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7)`,
    [campaignId, subject, body, bodyHtml, opts.audienceSource || null, scheduledDate.toISOString(), admin.email]
  );

  logActivity(admin.email, "newsletter_scheduled", "newsletter", {
    details: `Scheduled broadcast "${subject}" for ${scheduledDate.toISOString()} [${campaignId}]`,
  });

  return { campaignId };
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
      const result = await performChunk({
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

export async function addNewsletterSubscriber(email: string): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_newsletter");
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { error: "Valid email required" };
  }
  await db.query(
    `INSERT INTO public.newsletter_subscribers (email, source)
     VALUES ($1, 'admin_added')
     ON CONFLICT (email) DO UPDATE
       SET active = TRUE, unsubscribed_at = NULL`,
    [clean]
  );
  logActivity(admin.email, "newsletter_subscribe", "newsletter", { details: `Added subscriber: ${clean}` });
  return {};
}

export async function deleteNewsletterSubscriber(email: string): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_newsletter");
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { error: "Email required" };
  await db.query(
    `DELETE FROM public.newsletter_subscribers WHERE LOWER(email) = LOWER($1)`,
    [clean]
  );
  logActivity(admin.email, "newsletter_subscriber_deleted", "newsletter", { details: `Deleted subscriber: ${clean}` });
  return {};
}

export async function exportNewsletterSubscribers(opts?: {
  source?: string;
  emails?: string[];
}): Promise<{ csv: string; error?: string }> {
  await requirePermission("manage_newsletter");
  let where = "WHERE 1=1";
  const params: unknown[] = [];
  let idx = 1;

  if (opts?.source) {
    where += ` AND source = $${idx++}`;
    params.push(opts.source);
  }
  if (opts?.emails && opts.emails.length > 0) {
    where += ` AND LOWER(email) = ANY($${idx++}::text[])`;
    params.push(opts.emails.map((e) => e.toLowerCase()));
  }

  const rows = await db.query<{
    email: string;
    source: string;
    active: boolean;
    created_at: string;
    unsubscribed_at: string | null;
    last_sent_at: string | null;
  }>(
    `SELECT email, source, active, created_at, unsubscribed_at, last_sent_at
     FROM public.newsletter_subscribers
     ${where}
     ORDER BY created_at DESC`,
    params
  );
  const escape = (v: string | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["email", "source", "active", "created_at", "unsubscribed_at", "last_sent_at"];
  const lines = rows.map((r) =>
    [r.email, r.source, r.active ? "true" : "false", r.created_at, r.unsubscribed_at, r.last_sent_at]
      .map(escape)
      .join(",")
  );
  return { csv: [header.join(","), ...lines].join("\n") };
}

export async function importNewsletterSubscribers(
  raw: string
): Promise<{ added: number; skipped: number; invalid: number; error?: string }> {
  const admin = await requirePermission("manage_newsletter");
  const emails = (raw || "")
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  let added = 0;
  let skipped = 0;
  let invalid = 0;
  for (const email of emails) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      invalid++;
      continue;
    }
    try {
      const res = await db.query<{ email: string }>(
        `INSERT INTO public.newsletter_subscribers (email, source)
         VALUES ($1, 'imported')
         ON CONFLICT (email) DO NOTHING
         RETURNING email`,
        [email]
      );
      if (res.length > 0) added++;
      else skipped++;
    } catch {
      skipped++;
    }
  }
  logActivity(admin.email, "newsletter_import", "newsletter", {
    details: `Imported ${added} subscribers (${skipped} duplicates, ${invalid} invalid)`,
  });
  return { added, skipped, invalid };
}
