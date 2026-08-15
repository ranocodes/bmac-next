import crypto from "crypto";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/analytics/record";
import type { WorkflowKind, WorkflowPriority, WorkflowRecord, WorkflowStatus } from "@/types/cms";

const FORM_EVENT_NAMES: Partial<Record<WorkflowKind, string>> = {
  contact: "contact_submitted",
  member: "member_joined",
  volunteer: "volunteer_submitted",
  partner: "partner_submitted",
};

interface WorkflowRow {
  id: string;
  kind: string;
  ref_id: string;
  title: string;
  summary: string;
  status: string;
  priority: string;
  assignee_email: string;
  submitter_name: string;
  submitter_email: string;
  source: string;
  details: Record<string, unknown> | string;
  outcome: string;
  last_contacted_at: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

function rowToWorkflow(row: WorkflowRow): WorkflowRecord {
  let details: Record<string, unknown> = {};
  try {
    details = typeof row.details === "string" ? JSON.parse(row.details || "{}") : (row.details ?? {});
  } catch {
    details = {};
  }
  return {
    id: row.id,
    kind: row.kind as WorkflowKind,
    refId: row.ref_id || "",
    title: row.title,
    summary: row.summary || "",
    status: row.status as WorkflowStatus,
    priority: (row.priority || "normal") as WorkflowPriority,
    assigneeEmail: row.assignee_email || "",
    submitterName: row.submitter_name || "",
    submitterEmail: row.submitter_email || "",
    source: row.source || "",
    details,
    outcome: row.outcome || "",
    lastContactedAt: row.last_contacted_at || undefined,
    dueAt: row.due_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || undefined,
  };
}

export async function createWorkflowRecord(input: {
  kind: WorkflowKind;
  refId?: string;
  title: string;
  summary?: string;
  status?: WorkflowStatus;
  priority?: WorkflowPriority;
  assigneeEmail?: string;
  submitterName?: string;
  submitterEmail?: string;
  source?: string;
  details?: Record<string, unknown>;
  outcome?: string;
}): Promise<WorkflowRecord | null> {
  try {
    const rows = await db.query<WorkflowRow>(
      `INSERT INTO public.workflow_records
        (id, kind, ref_id, title, summary, status, priority, assignee_email, submitter_name, submitter_email, source, details, outcome)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13) RETURNING *`,
      [
        `wf-${crypto.randomUUID()}`,
        input.kind,
        input.refId || "",
        input.title,
        input.summary || "",
        input.status || "open",
        input.priority || "normal",
        input.assigneeEmail || "",
        input.submitterName || "",
        input.submitterEmail || "",
        input.source || "",
        JSON.stringify(input.details || {}),
        input.outcome || "",
      ]
    );
    if (rows.length) {
      const eventName = FORM_EVENT_NAMES[input.kind];
      if (eventName) {
        await recordEvent({
          name: eventName,
          path: "/",
          properties: { kind: input.kind, refId: rows[0].ref_id, source: rows[0].source },
        });
      }
    }
    return rows.length ? rowToWorkflow(rows[0]) : null;
  } catch (err) {
    console.error("createWorkflowRecord error:", err);
    return null;
  }
}

export async function listWorkflows(opts: {
  kind?: WorkflowKind;
  status?: WorkflowStatus;
  search?: string;
  limit?: number;
} = {}): Promise<WorkflowRecord[]> {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (opts.kind) {
      conditions.push(`kind = $${idx++}`);
      params.push(opts.kind);
    }
    if (opts.status) {
      conditions.push(`status = $${idx++}`);
      params.push(opts.status);
    }
    if (opts.search && opts.search.trim()) {
      conditions.push(`(title ILIKE $${idx} OR summary ILIKE $${idx} OR submitter_email ILIKE $${idx})`);
      params.push(`%${opts.search.trim()}%`);
      idx++;
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(opts.limit || 100);
    const rows = await db.query<WorkflowRow>(
      `SELECT * FROM public.workflow_records ${where} ORDER BY created_at DESC LIMIT $${idx}`,
      params
    );
    return rows.map(rowToWorkflow);
  } catch (err) {
    console.error("listWorkflows error:", err);
    return [];
  }
}

export async function getWorkflow(id: string): Promise<WorkflowRecord | null> {
  try {
    const rows = await db.query<WorkflowRow>("SELECT * FROM public.workflow_records WHERE id = $1", [id]);
    return rows.length ? rowToWorkflow(rows[0]) : null;
  } catch (err) {
    console.error("getWorkflow error:", err);
    return null;
  }
}

export async function updateWorkflow(
  id: string,
  patch: Partial<WorkflowRecord>
): Promise<WorkflowRecord | null> {
  try {
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const map: [keyof WorkflowRecord, string][] = [
      ["kind", "kind"],
      ["refId", "ref_id"],
      ["title", "title"],
      ["summary", "summary"],
      ["status", "status"],
      ["priority", "priority"],
      ["assigneeEmail", "assignee_email"],
      ["submitterName", "submitter_name"],
      ["submitterEmail", "submitter_email"],
      ["source", "source"],
      ["outcome", "outcome"],
      ["lastContactedAt", "last_contacted_at"],
      ["dueAt", "due_at"],
    ];
    for (const [key, col] of map) {
      const val = patch[key];
      if (val === undefined) continue;
      sets.push(`${col} = $${idx++}`);
      params.push(val);
    }
    if (patch.details !== undefined) {
      sets.push(`details = $${idx++}`);
      params.push(JSON.stringify(patch.details));
    }
    if (patch.status !== undefined) {
      sets.push(`resolved_at = ${patch.status === "resolved" || patch.status === "closed" ? "now()" : "NULL"}`);
    }
    if (!sets.length) return getWorkflow(id);
    params.push(id);
    const rows = await db.query<WorkflowRow>(
      `UPDATE public.workflow_records SET ${sets.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows.length ? rowToWorkflow(rows[0]) : null;
  } catch (err) {
    console.error("updateWorkflow error:", err);
    return null;
  }
}

export async function countOpenWorkflows(): Promise<number> {
  try {
    const rows = await db.query<{ count: string }>(
      "SELECT COUNT(*)::int AS count FROM public.workflow_records WHERE status IN ('open', 'in_progress')"
    );
    return Number(rows[0]?.count ?? 0);
  } catch (err) {
    console.error("countOpenWorkflows error:", err);
    return 0;
  }
}

export async function countWorkflowsByStatus(): Promise<Record<string, number>> {
  try {
    const rows = await db.query<{ status: string; count: string }>(
      "SELECT status, COUNT(*)::int AS count FROM public.workflow_records GROUP BY status"
    );
    const out: Record<string, number> = {};
    for (const r of rows) out[r.status] = Number(r.count ?? 0);
    return out;
  } catch (err) {
    console.error("countWorkflowsByStatus error:", err);
    return {};
  }
}

export async function resolveWorkflow(id: string, outcome: string): Promise<WorkflowRecord | null> {
  try {
    const rows = await db.query<WorkflowRow>(
      `UPDATE public.workflow_records
       SET status = 'resolved', outcome = $2, resolved_at = now(), updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, outcome]
    );
    return rows.length ? rowToWorkflow(rows[0]) : null;
  } catch (err) {
    console.error("resolveWorkflow error:", err);
    return null;
  }
}
