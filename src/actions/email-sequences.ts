"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import { sendRequest } from "@/lib/email";
import { logActivity } from "./activity-logs";

export type SequenceType = "welcome" | "renewal" | "re-engagement";
export type SequenceStatus = "pending" | "sent" | "failed" | "cancelled";

export interface EmailSequenceRow {
  id: string;
  sequence_type: SequenceType;
  person_id: string | null;
  email: string;
  first_name: string;
  template_type: string;
  template_vars: Record<string, unknown>;
  status: SequenceStatus;
  scheduled_at: string;
  sent_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

const WELCOME_STEPS = [
  { delay: 0, templateType: "welcome-step-1", subject: "Welcome to BMAC!" },
  { delay: 3, templateType: "welcome-step-2", subject: "Getting started with BMAC" },
  { delay: 7, templateType: "welcome-step-3", subject: "Your BMAC journey continues" },
];

const RENEWAL_STEPS = [
  { daysBefore: 30, templateType: "renewal-reminder-30", subject: "Your membership renews soon" },
  { daysBefore: 7, templateType: "renewal-reminder-7", subject: "Membership renewal in 7 days" },
  { daysBefore: 1, templateType: "renewal-reminder-1", subject: "Renew your BMAC membership tomorrow" },
];

const REENGAGEMENT_STEPS = [
  { daysInactive: 30, templateType: "re-engagement-30", subject: "We miss you at BMAC!" },
  { daysInactive: 60, templateType: "re-engagement-60", subject: "Still thinking about BMAC?" },
];

export async function scheduleWelcomeSequence(personId: string, email: string, firstName: string) {
  try {
    await requireAdmin();
  } catch {
    // Allow from cron/workflow context
  }

  const existing = await db.query<{ id: string }>(
    `SELECT id FROM public.email_sequences WHERE person_id = $1 AND sequence_type = 'welcome' AND status IN ('pending', 'sent') LIMIT 1`,
    [personId]
  );
  if (existing.length > 0) return { scheduled: 0, note: "Already scheduled" };

  const now = new Date();
  let scheduled = 0;

  for (const step of WELCOME_STEPS) {
    const scheduledAt = new Date(now);
    scheduledAt.setDate(scheduledAt.getDate() + step.delay);

    await db.create("email_sequences", {
      id: `es-${crypto.randomUUID()}`,
      sequence_type: "welcome",
      person_id: personId,
      email,
      first_name: firstName,
      template_type: step.templateType,
      template_vars: { firstName, loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login` },
      status: "pending",
      scheduled_at: scheduledAt.toISOString(),
    });
    scheduled++;
  }

  await logActivity("system", "sequence_scheduled", "email_sequences", {
    resourceId: personId,
    details: `Welcome sequence (${scheduled} steps) scheduled for ${email}`,
  });

  return { scheduled };
}

export async function scheduleRenewalSequence(personId: string, email: string, firstName: string, renewalDate: string) {
  try { await requireAdmin(); } catch { /* cron */ }

  const existing = await db.query<{ id: string }>(
    `SELECT id FROM public.email_sequences WHERE person_id = $1 AND sequence_type = 'renewal' AND status IN ('pending', 'sent') LIMIT 1`,
    [personId]
  );
  if (existing.length > 0) return { scheduled: 0, note: "Already scheduled" };

  const renewal = new Date(renewalDate);
  const now = new Date();
  let scheduled = 0;

  for (const step of RENEWAL_STEPS) {
    const scheduledAt = new Date(renewal);
    scheduledAt.setDate(scheduledAt.getDate() - step.daysBefore);
    if (scheduledAt <= now) continue;

    await db.create("email_sequences", {
      id: `es-${crypto.randomUUID()}`,
      sequence_type: "renewal",
      person_id: personId,
      email,
      first_name: firstName,
      template_type: step.templateType,
      template_vars: { firstName, renewalDate: renewal.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
      status: "pending",
      scheduled_at: scheduledAt.toISOString(),
    });
    scheduled++;
  }

  return { scheduled };
}

export async function scheduleReengagementSequence(personId: string, email: string, firstName: string, lastActiveAt: string) {
  try { await requireAdmin(); } catch { /* cron */ }

  const existing = await db.query<{ id: string }>(
    `SELECT id FROM public.email_sequences WHERE person_id = $1 AND sequence_type = 're-engagement' AND status IN ('pending', 'sent') LIMIT 1`,
    [personId]
  );
  if (existing.length > 0) return { scheduled: 0, note: "Already scheduled" };

  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  let scheduled = 0;

  for (const step of REENGAGEMENT_STEPS) {
    const scheduledAt = new Date(lastActive);
    scheduledAt.setDate(scheduledAt.getDate() + step.daysInactive);
    if (scheduledAt <= now) continue;

    await db.create("email_sequences", {
      id: `es-${crypto.randomUUID()}`,
      sequence_type: "re-engagement",
      person_id: personId,
      email,
      first_name: firstName,
      template_type: step.templateType,
      template_vars: { firstName, loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login` },
      status: "pending",
      scheduled_at: scheduledAt.toISOString(),
    });
    scheduled++;
  }

  return { scheduled };
}

export async function processEmailSequences(): Promise<{ processed: number; sent: number; failed: number }> {
  const rows = await db.query<EmailSequenceRow>(
    `SELECT * FROM public.email_sequences WHERE status = 'pending' AND scheduled_at <= NOW() ORDER BY scheduled_at ASC LIMIT 50`
  );

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const result = await sendRequest({
        type: row.template_type,
        email: row.email,
        firstName: row.first_name,
        ...row.template_vars,
      });

      if (result.error) {
        await db.update("email_sequences", row.id, {
          status: "failed",
          error: result.error,
          updated_at: new Date().toISOString(),
        });
        failed++;
      } else {
        await db.update("email_sequences", row.id, {
          status: "sent",
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        sent++;
      }
    } catch (err) {
      await db.update("email_sequences", row.id, {
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        updated_at: new Date().toISOString(),
      });
      failed++;
    }
  }

  return { processed: rows.length, sent, failed };
}

export async function cancelSequence(id: string) {
  await requireAdmin();
  await db.update("email_sequences", id, {
    status: "cancelled",
    updated_at: new Date().toISOString(),
  });
  return { success: true };
}

export async function cancelAllForPerson(personId: string) {
  await requireAdmin();
  const rows = await db.query<{ id: string }>(
    `SELECT id FROM public.email_sequences WHERE person_id = $1 AND status = 'pending'`,
    [personId]
  );
  for (const row of rows) {
    await db.update("email_sequences", row.id, {
      status: "cancelled",
      updated_at: new Date().toISOString(),
    });
  }
  return { cancelled: rows.length };
}

export async function listEmailSequences(opts: {
  status?: SequenceStatus;
  sequenceType?: SequenceType;
  limit?: number;
  offset?: number;
} = {}): Promise<{ rows: EmailSequenceRow[]; total: number }> {
  await requireAdmin();

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (opts.status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(opts.status);
  }
  if (opts.sequenceType) {
    conditions.push(`sequence_type = $${paramIdx++}`);
    params.push(opts.sequenceType);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = opts.limit || 50;
  const offset = opts.offset || 0;

  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM public.email_sequences ${where}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0", 10);

  const rows = await db.query<EmailSequenceRow>(
    `SELECT * FROM public.email_sequences ${where} ORDER BY scheduled_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function getSequenceStats(): Promise<{
  total: number;
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
}> {
  await requireAdmin();

  const rows = await db.query<{ status: string; count: string }>(
    `SELECT status, COUNT(*) as count FROM public.email_sequences GROUP BY status`
  );

  const stats = { total: 0, pending: 0, sent: 0, failed: 0, cancelled: 0 };
  for (const row of rows) {
    const count = parseInt(row.count, 10);
    stats.total += count;
    if (row.status in stats) (stats as Record<string, number>)[row.status] = count;
  }

  return stats;
}
