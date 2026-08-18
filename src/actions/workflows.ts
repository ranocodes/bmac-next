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

const APPLICATION_KINDS = ["program", "member", "volunteer"] as const;

export async function listApplicationWorkflows(
  filters: WorkflowFilters = {}
): Promise<WorkflowRecord[]> {
  await requirePermission("manage_workflows");
  const all = await listWorkflowRecords({ limit: filters.limit || 500 });
  return all.filter(r => (APPLICATION_KINDS as readonly string[]).includes(r.kind));
}

export async function getApplicationInboxStats(): Promise<{
  total: number;
  open: number;
  byKind: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  await requirePermission("manage_workflows");
  const all = await listWorkflowRecords({ limit: 1000 });
  const apps = all.filter(r => (APPLICATION_KINDS as readonly string[]).includes(r.kind));
  const byKind: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let open = 0;
  for (const r of apps) {
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    if (r.status === "open") open++;
  }
  return { total: apps.length, open, byKind, byStatus };
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
  answers: Record<string, unknown> | null;
} | null> {
  await requirePermission("manage_workflows");
  const record = await getWorkflow(id);
  if (!record) return null;

  let personId = record.refId;

  // For program workflows, refId is an application id — resolve person from program_applications
  if (record.kind === "program" && record.refId && record.refId.startsWith("app-")) {
    try {
      const appRows = await db.query<{ person_id: string }>(
        "SELECT person_id FROM public.program_applications WHERE id = $1",
        [record.refId]
      );
      if (appRows.length) personId = appRows[0].person_id;
    } catch (err) {
      console.error("getWorkflowDetail program application lookup error:", err);
    }
  }

  let person: {
    person: { id: string; firstName: string; lastName: string; email: string; phone: string };
    records: { id: string; kind: string; status: string; createdAt: string }[];
    isAdmin: boolean;
  } | null = null;
  if (personId) {
    try {
      const pRows = await db.query<{
        id: string; first_name: string; last_name: string; email: string; phone: string;
      }>("SELECT id, first_name, last_name, email, phone FROM public.people WHERE id = $1", [personId]);
      if (pRows.length) {
        const p = pRows[0];
        const recRows = await db.query<{
          id: string; kind: string; status: string; created_at: string;
        }>("SELECT id, kind, status, created_at FROM public.person_records WHERE person_id = $1 ORDER BY created_at DESC", [personId]);
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

  // Load form submission answers
  let answers: Record<string, unknown> | null = null;
  const formSubmissionId = record.details?.formSubmissionId;
  if (formSubmissionId) {
    try {
      const subRows = await db.query<{ answers: unknown }>(
        "SELECT answers FROM public.form_submissions WHERE id = $1",
        [formSubmissionId]
      );
      if (subRows.length && subRows[0].answers) {
        answers = typeof subRows[0].answers === "string" ? JSON.parse(subRows[0].answers as string) : subRows[0].answers as Record<string, unknown>;
      }
    } catch (err) {
      console.error("getWorkflowDetail form submission lookup error:", err);
    }
  }

  // Fallback: find latest form submission by person
  if (!answers && personId) {
    try {
      const subRows = await db.query<{ answers: unknown }>(
        "SELECT answers FROM public.form_submissions WHERE person_id = $1 ORDER BY created_at DESC LIMIT 1",
        [personId]
      );
      if (subRows.length && subRows[0].answers) {
        answers = typeof subRows[0].answers === "string" ? JSON.parse(subRows[0].answers as string) : subRows[0].answers as Record<string, unknown>;
      }
    } catch (err) {
      console.error("getWorkflowDetail fallback form submission lookup error:", err);
    }
  }

  return { record, person, answers };
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

const APPLICATION_KINDS_SET = new Set(["program", "member", "volunteer"]);

export async function acceptApplicationWorkflow(
  workflowId: string
): Promise<{ error?: string; record?: WorkflowRecord }> {
  const admin = await requirePermission("manage_workflows");
  const record = await getWorkflow(workflowId);
  if (!record) return { error: "Submission not found" };
  if (!APPLICATION_KINDS_SET.has(record.kind)) return { error: "Not an application workflow" };

  const at = new Date().toISOString();
  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  history.push({ type: "status", by: admin.email, at, note: "Application accepted" });

  // Update workflow to resolved
  const updated = await updateWorkflow(workflowId, {
    status: "resolved",
    details: { ...record.details, history },
  });
  if (!updated) return { error: "Failed to update workflow" };

  // For program applications, update the application record
  if (record.kind === "program" && record.refId?.startsWith("app-")) {
    try {
      const { updateApplicationStatus } = await import("./programs");
      await updateApplicationStatus({
        applicationId: record.refId,
        status: "accepted",
        adminEmail: admin.email,
      });
    } catch (err) {
      console.error("acceptApplicationWorkflow program update error:", err);
    }
  }

  // For member/volunteer applications, update the person record status
  if (record.kind === "member" || record.kind === "volunteer") {
    try {
      const personId = record.refId;
      if (personId) {
        await db.query(
          "UPDATE public.person_records SET status = 'accepted' WHERE person_id = $1 AND kind = $2 AND status IN ('pending', 'open')",
          [personId, record.kind]
        );
        // Ensure the role is set
        const roleMap: Record<string, string> = { member: "member", volunteer: "volunteer" };
        const targetRole = roleMap[record.kind];
        if (targetRole) {
          await db.query(
            "UPDATE public.people SET roles = CASE WHEN $2 = ANY(SELECT unnest(string_to_array(roles, ','))) THEN roles ELSE CASE WHEN roles = '' THEN $2 ELSE roles || ',' || $2 END END WHERE id = $1",
            [personId, targetRole]
          );
        }
      }
    } catch (err) {
      console.error("acceptApplicationWorkflow person update error:", err);
    }
  }

  // Send acceptance email
  if (record.submitterEmail) {
    const firstName = record.submitterName?.split(" ")[0] || "";
    await sendApplicationStatusEmail({
      email: record.submitterEmail,
      firstName,
      kindLabel: record.kind,
      status: "accepted",
      note: record.details?.cohortTitle
        ? `You have been accepted into the ${record.details.cohortTitle} cohort.`
        : undefined,
    }).catch(err => console.error("acceptance email error:", err));
  }

  await logActivity(admin.email, "workflow_update", "workflow_records", {
    resourceId: workflowId,
    details: `Accepted application ${workflowId} (${record.kind})`,
  });
  return { record: updated };
}

export async function rejectApplicationWorkflow(
  workflowId: string
): Promise<{ error?: string; record?: WorkflowRecord }> {
  const admin = await requirePermission("manage_workflows");
  const record = await getWorkflow(workflowId);
  if (!record) return { error: "Submission not found" };
  if (!APPLICATION_KINDS_SET.has(record.kind)) return { error: "Not an application workflow" };

  const at = new Date().toISOString();
  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  history.push({ type: "status", by: admin.email, at, note: "Application rejected" });

  // Update workflow to closed
  const updated = await updateWorkflow(workflowId, {
    status: "closed",
    details: { ...record.details, history },
  });
  if (!updated) return { error: "Failed to update workflow" };

  // For program applications, update the application record
  if (record.kind === "program" && record.refId?.startsWith("app-")) {
    try {
      const { updateApplicationStatus } = await import("./programs");
      await updateApplicationStatus({
        applicationId: record.refId,
        status: "rejected",
        adminEmail: admin.email,
      });
    } catch (err) {
      console.error("rejectApplicationWorkflow program update error:", err);
    }
  }

  // For member/volunteer applications, update the person record status
  if (record.kind === "member" || record.kind === "volunteer") {
    try {
      const personId = record.refId;
      if (personId) {
        await db.query(
          "UPDATE public.person_records SET status = 'rejected' WHERE person_id = $1 AND kind = $2 AND status IN ('pending', 'open')",
          [personId, record.kind]
        );
      }
    } catch (err) {
      console.error("rejectApplicationWorkflow person update error:", err);
    }
  }

  // Send rejection email
  if (record.submitterEmail) {
    const firstName = record.submitterName?.split(" ")[0] || "";
    await sendApplicationStatusEmail({
      email: record.submitterEmail,
      firstName,
      kindLabel: record.kind,
      status: "rejected",
      note: "You are welcome to reapply for a future cohort.",
    }).catch(err => console.error("rejection email error:", err));
  }

  await logActivity(admin.email, "workflow_update", "workflow_records", {
    resourceId: workflowId,
    details: `Rejected application ${workflowId} (${record.kind})`,
  });
  return { record: updated };
}
