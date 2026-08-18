"use server";

import {
  listWorkflows as listWorkflowRecords,
  getWorkflow,
  updateWorkflow,
  countOpenWorkflows,
  countWorkflowsByStatus,
} from "@/lib/workflows";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
import { sendAdminReplyEmail, sendApplicationStatusEmail } from "@/lib/email";
import type {
  WorkflowKind,
  WorkflowPriority,
  WorkflowRecord,
  WorkflowStatus,
} from "@/types/cms";

export interface WorkflowFilters {
  kind?: WorkflowKind | "";
  status?: WorkflowStatus | "";
  search?: string;
  limit?: number;
}

export async function listWorkflows(
  filters: WorkflowFilters = {}
): Promise<WorkflowRecord[]> {
  await requirePermission("manage_workflows");
  return listWorkflowRecords({
    kind: filters.kind || undefined,
    status: filters.status || undefined,
    search: filters.search,
    limit: filters.limit,
  });
}

export async function getWorkflowQueueCounts(): Promise<{
  byStatus: Record<string, number>;
  open: number;
}> {
  await requirePermission("manage_workflows");
  const byStatus = await countWorkflowsByStatus();
  const open = await countOpenWorkflows();
  return { byStatus, open };
}

export async function getInboxStats(): Promise<{
  total: number;
  open: number;
  byKind: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  await requirePermission("manage_workflows");
  const all = await listWorkflowRecords({ limit: 1000 });
  const byKind: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let open = 0;
  for (const r of all) {
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    if (r.status === "open") open++;
  }
  return { total: all.length, open, byKind, byStatus };
}

export async function getInboxStatsByStream(): Promise<{
  applications: number;
  donations: number;
  inquiries: number;
  events: number;
  other: number;
  total: number;
}> {
  await requirePermission("manage_workflows");
  const rows = await db.query<{ stream: string; open_count: string }>(`
    SELECT
      CASE
        WHEN kind IN ('program', 'volunteer', 'member', 'school-chapter', 'partner') THEN 'applications'
        WHEN kind = 'donation' THEN 'donations'
        WHEN kind = 'contact' THEN 'inquiries'
        WHEN kind IN ('event_registration', 'ticket') THEN 'events'
        ELSE 'other'
      END as stream,
      COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) as open_count
    FROM workflow_records
    GROUP BY stream
  `);
  const counts = { applications: 0, donations: 0, inquiries: 0, events: 0, other: 0, total: 0 };
  for (const r of rows) {
    const key = r.stream as keyof typeof counts;
    if (key in counts) {
      counts[key] = Number(r.open_count ?? 0);
      counts.total += Number(r.open_count ?? 0);
    }
  }
  return counts;
}

export async function getWorkflowDetail(
  id: string
): Promise<{
  record: WorkflowRecord;
  person: {
    person: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    records: { id: string; kind: string; status: string; createdAt: string }[];
    isAdmin: boolean;
  } | null;
} | null> {
  await requirePermission("manage_workflows");
  const record = await getWorkflow(id);
  if (!record) return null;

  let person: {
    person: { id: string; firstName: string; lastName: string; email: string; phone: string };
    records: { id: string; kind: string; status: string; createdAt: string }[];
    isAdmin: boolean;
  } | null = null;
  if (record.refId) {
    try {
      const pRows = await db.query<{
        id: string; first_name: string; last_name: string; email: string; phone: string;
      }>("SELECT id, first_name, last_name, email, phone FROM public.people WHERE id = $1", [record.refId]);
      if (pRows.length) {
        const p = pRows[0];
        const recRows = await db.query<{
          id: string; kind: string; status: string; created_at: string;
        }>("SELECT id, kind, status, created_at FROM public.person_records WHERE person_id = $1 ORDER BY created_at DESC", [record.refId]);
        const adminRows = await db.query<{ id: string }>(
          "SELECT id FROM public.admin_users WHERE LOWER(email) = LOWER($1)",
          [p.email]
        );
        person = {
          person: {
            id: p.id,
            firstName: p.first_name || "",
            lastName: p.last_name || "",
            email: p.email || "",
            phone: p.phone || "",
          },
          records: recRows.map(r => ({ id: r.id, kind: r.kind, status: r.status, createdAt: r.created_at })),
          isAdmin: adminRows.length > 0,
        };
      }
    } catch (err) {
      console.error("getWorkflowDetail person lookup error:", err);
    }
  }

  return { record, person };
}

export async function updateWorkflowStatus(
  id: string,
  opts: {
    status?: WorkflowStatus;
    priority?: WorkflowPriority;
    assigneeEmail?: string;
    outcome?: string;
    note?: string;
  }
): Promise<{ error?: string; record?: WorkflowRecord }> {
  const admin = await requirePermission("manage_workflows");
  const record = await getWorkflow(id);
  if (!record) return { error: "Submission not found" };

  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  const at = new Date().toISOString();
  const note = opts.note?.trim();
  if (note) {
    history.push({ type: "note", by: admin.email, at, note });
  }
  if (opts.status && opts.status !== record.status) {
    history.push({
      type: "status",
      by: admin.email,
      at,
      note: `Status changed to ${opts.status}${note ? ` — ${note}` : ""}`,
    });
  }

  const updated = await updateWorkflow(id, {
    status: opts.status,
    priority: opts.priority,
    assigneeEmail: opts.assigneeEmail,
    outcome: opts.outcome,
    details: { ...record.details, history },
  });
  if (!updated) return { error: "Failed to update submission" };

  if (opts.status && opts.status !== record.status && record.submitterEmail) {
    const firstName = record.submitterName?.split(" ")[0] || "";
    await sendApplicationStatusEmail({
      email: record.submitterEmail,
      firstName,
      kindLabel: record.kind,
      status: opts.status,
    }).catch(err => console.error("application-status email error:", err));
  }

  await logActivity(admin.email, "workflow_update", "workflow_records", {
    resourceId: id,
    details: `Updated workflow ${id}: status=${updated.status}, priority=${updated.priority}, assignee=${updated.assigneeEmail || "none"}`,
  });
  return { record: updated };
}

export async function setLastContacted(
  id: string
): Promise<{ error?: string; record?: WorkflowRecord }> {
  const admin = await requirePermission("manage_workflows");
  const record = await getWorkflow(id);
  if (!record) return { error: "Submission not found" };

  const at = new Date().toISOString();
  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  history.push({ type: "contact", by: admin.email, at, note: "Marked as contacted" });

  const updated = await updateWorkflow(id, {
    lastContactedAt: at,
    details: { ...record.details, history },
  });
  if (!updated) return { error: "Failed to update submission" };

  await logActivity(admin.email, "workflow_update", "workflow_records", {
    resourceId: id,
    details: `Marked workflow ${id} as contacted`,
  });
  return { record: updated };
}

export async function deleteWorkflow(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const admin = await requirePermission("manage_workflows");
  const record = await getWorkflow(id);
  if (!record) return { error: "Submission not found" };

  const removed = await db.remove("workflow_records", id);
  if (!removed) return { error: "Failed to delete submission" };

  await logActivity(admin.email, "workflow_delete", "workflow_records", {
    resourceId: id,
    details: `Deleted workflow ${id} (${record.kind})`,
  });
  return { success: true };
}

export async function replyToSubmission(
  workflowId: string,
  opts: { body: string }
): Promise<{ error?: string; success?: boolean; repliedAt?: string }> {
  const admin = await requirePermission("manage_workflows");
  const body = opts.body?.trim();
  if (!body) return { error: "Reply body is required" };

  const record = await getWorkflow(workflowId);
  if (!record) return { error: "Submission not found" };
  if (!record.submitterEmail) return { error: "No submitter email on this record" };

  const sent = await sendAdminReplyEmail({
    email: record.submitterEmail,
    subject: `Re: ${record.title}`,
    body,
    originalTitle: record.title,
  });
  if (sent.error) return { error: "Reply email failed to send. Try again." };

  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  const repliedAt = new Date().toISOString();
  await updateWorkflow(workflowId, {
    details: {
      ...record.details,
      history: [...history, { type: "reply", by: admin.email, at: repliedAt, note: body }],
    },
    lastContactedAt: repliedAt,
  });
  await logActivity(admin.email, "reply", "workflow_records", {
    resourceId: workflowId,
    details: `Replied to ${record.submitterEmail}: ${body.slice(0, 100)}`,
  });
  return { success: true, repliedAt };
}
