"use server";

import { redirect } from "next/navigation";
import { verifySuperAdminCredentials, setSuperAdminSession, clearSuperAdminSession, registerFirstAdmin, createInvite, acceptInvite, getSuperAdminCount, createPasswordResetToken, resetPassword } from "@/lib/auth/super-admin";
import { sendPasswordResetEmail } from "@/lib/email";
import type { AdminRole, Permission } from "@/types/cms";

export async function loginAdmin(email: string, password: string): Promise<{ error?: string }> {
  if (!email || !password) return { error: "Email and password required" };

  const info = await verifySuperAdminCredentials(email, password);
  if (!info) return { error: "Invalid credentials" };

  await setSuperAdminSession(info.email, info.firstName, info.permissions, info.role);
  return {};
}

export async function logoutAdmin(): Promise<void> {
  await clearSuperAdminSession();
  redirect("/admin/login");
}

export async function registerFirstAdminAction(email: string, password: string, firstName: string): Promise<{ error?: string }> {
  return registerFirstAdmin(email, password, firstName);
}

export async function createInviteAction(
  email: string, createdById: string,
  opts: { firstName: string; role: AdminRole; permissions: Permission[]; tempPassword: string }
): Promise<{ token?: string; error?: string }> {
  return createInvite(email, createdById, opts);
}

export async function acceptInviteAction(token: string, tempPassword: string, newPassword: string, firstName: string = ""): Promise<{ error?: string }> {
  return acceptInvite(token, tempPassword, newPassword, firstName);
}

export async function hasAnyAdmins(): Promise<boolean> {
  const count = await getSuperAdminCount();
  return count > 0;
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  if (!email) return { success: false };
  const token = await createPasswordResetToken(email);
  if (token) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendPasswordResetEmail(email, `${baseUrl}/admin/reset-password/${token}`);
  }
  return { success: true };
}

export async function executePasswordReset(token: string, newPassword: string): Promise<{ error?: string }> {
  if (!token || !newPassword) return { error: "Token and password required" };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };
  return resetPassword(token, newPassword);
}

export async function adminResetPassword(adminUserId: string): Promise<{ error?: string }> {
  const { db } = await import("@/lib/db");
  const { requirePermission } = await import("@/lib/auth/server");
  await requirePermission("manage_users");

  const rows = await db.query<{ email: string }>(
    "SELECT email FROM public.admin_users WHERE id = $1", [adminUserId]);
  if (rows.length === 0) return { error: "Admin not found" };

  const email = rows[0].email;
  const token = await createPasswordResetToken(email);
  if (!token) return { error: "No account found with that email" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendPasswordResetEmail(email, `${baseUrl}/admin/reset-password/${token}`);
  return {};
}
