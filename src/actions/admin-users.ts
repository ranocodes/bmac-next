"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { sendInviteEmail } from "@/lib/email";

export async function getAdminUsers() {
  await requirePermission("manage_users");
  return db.query<any>("SELECT id, email, first_name, role, permissions, created_at FROM public.admin_users ORDER BY created_at ASC");
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  await requirePermission("manage_users");
  return db.update("admin_users", id, { permissions });
}

export async function deleteAdminUser(id: string) {
  await requirePermission("manage_users");
  return db.remove("admin_users", id);
}

export async function getInvites() {
  await requirePermission("manage_users");
  return db.query<any>(
    "SELECT id, email, first_name, role, token, created_at, expires_at, used_at FROM public.admin_invites ORDER BY created_at DESC"
  );
}

export async function resendInviteAction(inviteId: string): Promise<{ error?: string }> {
  await requirePermission("manage_users");

  const rows = await db.query<{ email: string; first_name: string; token: string }>(
    "SELECT email, first_name, token FROM public.admin_invites WHERE id = $1", [inviteId]);
  if (rows.length === 0) return { error: "Invite not found" };

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const inviteLink = `${baseUrl}/admin/invite/${rows[0].token}`;
  const result = await sendInviteEmail(rows[0].email, inviteLink, rows[0].first_name);
  return result;
}
