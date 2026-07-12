"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { sendInviteEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import bcrypt from "bcryptjs";
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

export async function getInvites() {
  await requirePermission("manage_users");
  return db.query<any>(
    "SELECT id, email, first_name, role, token, created_at, expires_at, used_at FROM public.admin_invites ORDER BY created_at DESC"
  );
}

export async function resendInviteAction(inviteId: string): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_users");

  const rows = await db.query<{ email: string; first_name: string; token: string; expires_at: string }>(
    "SELECT email, first_name, token, expires_at FROM public.admin_invites WHERE id = $1", [inviteId]);
  if (rows.length === 0) return { error: "Invite not found" };

  if (new Date(rows[0].expires_at) < new Date()) {
    return { error: "Invite has expired — revoke and create a new one" };
  }

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let tempPassword = "";
  for (let i = 0; i < 14; i++) tempPassword += chars[Math.floor(Math.random() * chars.length)];
  const tempHash = bcrypt.hashSync(tempPassword, 12);
  await db.query("UPDATE public.admin_invites SET temp_password_hash = $1 WHERE id = $2", [tempHash, inviteId]);

  const baseUrl = await getBaseUrl();
  const inviteLink = `${baseUrl}/admin/invite/${rows[0].token}`;
  const result = await sendInviteEmail(rows[0].email, inviteLink, rows[0].first_name, tempPassword);
  if (!result.error) {
    logActivity(admin.email, "invite_resend", "auth", { details: `Resent invite to ${rows[0].email}` });
  }
  return result;
}

export async function deleteInviteAction(inviteId: string): Promise<{ error?: string }> {
  const admin = await requirePermission("manage_users");

  const rows = await db.query<{ email: string }>(
    "SELECT email FROM public.admin_invites WHERE id = $1", [inviteId]);
  if (rows.length === 0) return { error: "Invite not found" };

  if (rows[0].email === admin.email) return { error: "Cannot revoke your own invite" };

  await db.query("DELETE FROM public.admin_invites WHERE id = $1", [inviteId]);
  logActivity(admin.email, "invite_revoke", "auth", { details: `Revoked invite for ${rows[0].email}` });
  return {};
}
