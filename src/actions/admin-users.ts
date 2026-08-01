"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
import { sendAdminDeletedNotification, sendAdminDeleteAttemptAlert } from "@/lib/email";

export async function getAdminUsers() {
  await requirePermission("manage_users");
  return db.query<any>("SELECT id, email, first_name, role, permissions, created_at FROM public.admin_users ORDER BY created_at ASC");
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  await requirePermission("manage_users");
  return db.update("admin_users", id, { permissions });
}

export async function deleteAdminUser(id: string) {
  const admin = await requirePermission("manage_users");

  const rows = await db.query<{ email: string; role: string }>(
    "SELECT email, role FROM public.admin_users WHERE id = $1", [id]);
  if (rows.length === 0) return { error: "Admin not found" };

  const target = rows[0];
  if (target.email === admin.email) {
    const others = await db.query<{ email: string }>(
      "SELECT email FROM public.super_admins WHERE LOWER(email) != LOWER($1)", [admin.email]);
    Promise.allSettled(others.map(o => sendAdminDeleteAttemptAlert(o.email, admin.email)));
    return { error: "Cannot delete yourself" };
  }

  const isSuper = target.role === "super_admin";

  if (isSuper) {
    const superRows = await db.query<{ id: string }>(
      "SELECT id FROM public.super_admins WHERE LOWER(email) = LOWER($1)", [target.email]);
    if (superRows.length > 0) {
      const count = await db.query<{ count: string }>("SELECT COUNT(*) AS count FROM public.super_admins");
      if (Number(count[0]?.count ?? 0) <= 1) {
        return { error: "Cannot delete the last super admin" };
      }
    }
  }

  if (isSuper) {
    await db.query("DELETE FROM public.super_admins WHERE LOWER(email) = LOWER($1)", [target.email]);
  }
  await db.remove("admin_users", id);
  logActivity(admin.email, "admin_delete", "auth", { details: `Deleted admin: ${target.email}` });

  if (isSuper) {
    const remaining = await db.query<{ email: string }>(
      "SELECT email FROM public.super_admins WHERE LOWER(email) != LOWER($1)", [target.email]);
    Promise.allSettled(remaining.map(r => sendAdminDeletedNotification(r.email, target.email, admin.email)));
  }

  return {};
}

export async function updateAdminUser(
  id: string,
  opts: { firstName?: string; email?: string }
): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_users");
  const { updateAdmin } = await import("@/lib/auth/client");

  if (opts.email && opts.email.toLowerCase() === admin.email) {
    return { error: "Cannot change your own email" };
  }

  const result = await updateAdmin(id, opts);
  if (result.error) return { error: result.error };
  logActivity(admin.email, "admin_update", "auth", { details: `Updated ${result.email || id}` });
  return {};
}

export async function resendCredentialsAction(id: string): Promise<{ error?: string; email?: string; password?: string; warning?: string }> {
  const admin = await requirePermission("manage_users");
  const { resendCredentials } = await import("@/lib/auth/client");

  const result = await resendCredentials(id);
  if (result.error) return { error: result.error };
  logActivity(admin.email, "credentials_sent", "auth", { details: `Credentials resent to ${result.email || id}` });
  return { email: result.email, password: result.password, warning: result.warning };
}
