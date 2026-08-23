import crypto from "crypto";
import { db } from "@/lib/db";

export async function logActivity(
  user: string,
  action: string,
  resource: string,
  opts?: { resourceId?: string; details?: string }
) {
  try {
    const id = `log-${action.slice(0, 24)}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    await db.query(
      `INSERT INTO public.activity_logs (id, "user", action, resource, resource_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, user, action, resource, opts?.resourceId || null, opts?.details || null]
    );
  } catch (e) {
    console.error("logActivity error:", e);
  }
}
