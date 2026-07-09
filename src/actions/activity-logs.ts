"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";

export async function logActivity(
  user: string,
  action: string,
  resource: string,
  opts?: { resourceId?: string; details?: string }
) {
  try {
    const id = `log-${action.slice(0, 24)}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    await db.create("activity_logs", {
      id, user, action, resource,
      resource_id: opts?.resourceId || null,
      details: opts?.details || null,
    });
  } catch (e) {
    console.error("logActivity error:", e);
  }
}

export async function clearActivityLogs(search: string, actionFilter: string): Promise<{ deleted: number; error?: string }> {
  await requirePermission("manage_users");

  const conditions: string[] = [];
  const params: string[] = [];
  let idx = 1;

  if (search) {
    const q = `%${search.toLowerCase()}%`;
    conditions.push(`(LOWER("user") LIKE $${idx} OR LOWER(resource) LIKE $${idx} OR LOWER(COALESCE(details,'')) LIKE $${idx})`);
    params.push(q);
    idx++;
  }

  if (actionFilter) {
    conditions.push(`action = $${idx}`);
    params.push(actionFilter);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM public.activity_logs ${where}`,
      params.length > 0 ? params : undefined
    );
    const total = Number(result[0]?.count ?? 0);

    await db.query(
      `DELETE FROM public.activity_logs ${where}`,
      params.length > 0 ? params : undefined
    );

    return { deleted: total };
  } catch (e: any) {
    return { deleted: 0, error: e?.message || "Failed to clear logs" };
  }
}
