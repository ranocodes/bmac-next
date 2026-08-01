"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";

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
  if (admin.email === admin.email && id === admin.adminId) return { error: "Cannot delete yourself" };

  const rows = await db.query<{ email: string }>(
    "SELECT email FROM public.admin_users WHERE id = $1", [id]);
  if (rows.length === 0) return { error: "Admin not found" };
  if (rows[0].email === admin.email) return { error: "Cannot delete yourself" };

  const superRows = await db.query<{ id: string }>(
    "SELECT id FROM public.super_admins WHERE email = $1", [rows[0].email]);
  if (superRows.length > 0) {
    await db.query("DELETE FROM public.super_admins WHERE id = $1", [superRows[0].id]);
  }
  await db.remove("admin_users", id);
  logActivity(admin.email, "admin_delete", "auth", { details: `Deleted admin: ${rows[0].email}` });
  return {};
}
