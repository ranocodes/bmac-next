"use server";

import { redirect } from "next/navigation";
import { verifySuperAdminCredentials, setSuperAdminSession, clearSuperAdminSession, registerFirstAdmin, createInvite, acceptInvite, getSuperAdminCount, createPasswordResetToken, resetPassword, getSuperAdminSession } from "@/lib/auth/super-admin";
import { sendPasswordResetEmail, sendInviteEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import { logActivity } from "./activity-logs";
import type { AdminRole, Permission } from "@/types/cms";

export async function loginAdmin(email: string, password: string): Promise<{ error?: string }> {
  try {
    if (!email || !password) return { error: "Email and password required" };
    const info = await verifySuperAdminCredentials(email, password);
    if (!info) return { error: "Invalid email or password" };
    await setSuperAdminSession(info.email, info.firstName, info.permissions, info.role);
    logActivity(info.email, "login", "auth", { details: "Admin login" });
    return {};
  } catch (e) {
    console.error("loginAdmin error:", e);
    return { error: e instanceof Error ? e.message : "Login failed. Try again." };
  }
}

export async function logoutAdmin(): Promise<void> {
  const session = await getSuperAdminSession().catch(() => null);
  await clearSuperAdminSession();
  if (session) logActivity(session.email, "logout", "auth", { details: "Admin logout" });
  redirect("/admin/login");
}

export async function registerFirstAdminAction(email: string, password: string, firstName: string): Promise<{ error?: string }> {
  const result = await registerFirstAdmin(email, password, firstName);
  if (!result.error) logActivity(email, "register", "auth", { details: `First admin registered: ${firstName}` });
  return result;
}

export async function createInviteAction(
  email: string, createdById: string,
  opts: { firstName: string; role: AdminRole; permissions: Permission[]; tempPassword: string }
): Promise<{ token?: string; error?: string }> {
  const { db } = await import("@/lib/db");
  const rows = await db.query<{ id: string }>(
    "SELECT id FROM public.super_admins WHERE email = $1", [createdById]);
  if (rows.length === 0) return { error: "Creator account not found" };

  const result = await createInvite(email, rows[0].id, opts);
  if (result.error || !result.token) return result;

  const baseUrl = await getBaseUrl();
  const inviteLink = `${baseUrl}/admin/invite/${result.token}`;
  await sendInviteEmail(email, inviteLink, opts.firstName, opts.tempPassword);
  logActivity(createdById, "invite_create", "auth", { details: `Invited ${email} as ${opts.role}` });

  return result;
}

export async function acceptInviteAction(token: string, tempPassword: string, newPassword: string, firstName: string = ""): Promise<{ error?: string }> {
  const result = await acceptInvite(token, tempPassword, newPassword, firstName);
  if (!result.error) {
    const session = await getSuperAdminSession().catch(() => null);
    if (session) logActivity(session.email, "invite_accept", "auth", { details: "Invite accepted" });
  }
  return result;
}

export async function hasAnyAdmins(): Promise<boolean> {
  const count = await getSuperAdminCount();
  return count > 0;
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    if (!email) return { error: "Email is required" };
    const token = await createPasswordResetToken(email);
    if (token) {
      const baseUrl = await getBaseUrl();
      const result = await sendPasswordResetEmail(email, `${baseUrl}/admin/reset-password/${token}`);
      if (result.error) return { error: "Failed to send reset email. Try again later." };
      logActivity("system", "password_reset_request", "auth", { details: `Reset email sent to ${email}` });
    }
    return {};
  } catch (e) {
    console.error("requestPasswordReset error:", e);
    return { error: "Something went wrong. Try again." };
  }
}

export async function executePasswordReset(token: string, newPassword: string): Promise<{ error?: string }> {
  if (!token || !newPassword) return { error: "Token and password required" };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };
  const result = await resetPassword(token, newPassword);
  if (!result.error) logActivity("system", "password_reset", "auth", { details: "Password reset completed" });
  return result;
}

export async function adminResetPassword(adminUserId: string): Promise<{ error?: string }> {
  try {
    const { db } = await import("@/lib/db");
    const { requirePermission } = await import("@/lib/auth/server");
    const admin = await requirePermission("manage_users");

    const rows = await db.query<{ email: string }>(
      "SELECT email FROM public.admin_users WHERE id = $1", [adminUserId]);
    if (rows.length === 0) return { error: "Admin not found" };

    const targetEmail = rows[0].email;
    const token = await createPasswordResetToken(targetEmail);
    if (!token) return { error: "No account found with that email" };

    const baseUrl = await getBaseUrl();
    const result = await sendPasswordResetEmail(targetEmail, `${baseUrl}/admin/reset-password/${token}`);
    if (result.error) return { error: "Failed to send reset email. Try again later." };
    logActivity(admin.email, "admin_password_reset", "auth", { details: `Reset email sent to ${targetEmail}` });
    return {};
  } catch (e) {
    console.error("adminResetPassword error:", e);
    return { error: "Something went wrong. Try again." };
  }
}
