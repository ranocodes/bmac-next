"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { setSuperAdminSession, clearSuperAdminSession, getSuperAdminSession } from "@/lib/auth/super-admin";
import * as authClient from "@/lib/auth/client";
import { logActivity } from "./activity-logs";
import { isLoginLocked, recordLoginAttempt } from "@/lib/rate-limit";
import type { AdminRole, Permission } from "@/types/cms";

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}

export async function loginAdmin(email: string, password: string): Promise<{ error?: string }> {
  try {
    if (!email || !password) return { error: "Email and password required" };
    const ip = await clientIp();
    if (await isLoginLocked(email, ip)) {
      return { error: "Too many failed attempts. Try again in 15 minutes." };
    }
    const info = await authClient.loginAdmin(email, password);
    if (!info.email || info.error) {
      await recordLoginAttempt(email, ip, false);
      return { error: info.error || "Invalid email or password" };
    }
    await recordLoginAttempt(email, ip, true);
    await setSuperAdminSession(info.email, info.firstName || "", info.permissions, info.role);
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
  try {
    const info = await authClient.registerFirstAdmin(email, password, firstName);
    if (info.error) return { error: info.error };
    await setSuperAdminSession(info.email!, info.firstName || "", info.permissions, info.role);
    logActivity(info.email!, "register", "auth", { details: `First admin registered: ${firstName}` });
    return {};
  } catch (e: any) {
    return { error: e?.message || "Failed to create admin" };
  }
}

export async function createAdminAction(
  createdByEmail: string,
  opts: { email: string; firstName: string; role: AdminRole; permissions: Permission[]; password: string }
): Promise<{ error?: string; warning?: string }> {
  const result = await authClient.createAdmin(createdByEmail, opts);
  if (!result.error) {
    logActivity(createdByEmail, "admin_create", "auth", { details: `Created ${opts.email} as ${opts.role}` });
    const { createAdminNotification, emailSuperAdmins } = await import("@/lib/notifications");
    const { sendAdminCreatedAlertEmail } = await import("@/lib/email");
    await emailSuperAdmins(adminEmail =>
      sendAdminCreatedAlertEmail({
        email: adminEmail,
        newAdminEmail: opts.email,
        newAdminRole: opts.role,
        createdBy: createdByEmail,
      })
    );
  }
  return result;
}

export async function sendCredentialsAction(opts: { email: string; firstName: string; password: string; role: AdminRole }): Promise<{ error?: string }> {
  const result = await authClient.sendCredentials(opts);
  if (!result.error) logActivity(opts.email, "credentials_sent", "auth", { details: `Credentials emailed to ${opts.email}` });
  return result;
}

export async function hasAnyAdmins(): Promise<boolean> {
  const count = await authClient.getAdminsCount();
  return count > 0;
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    if (!email) return { error: "Email is required" };
    const result = await authClient.requestPasswordReset(email);
    if (result.error) return { error: result.error };
    logActivity("system", "password_reset_request", "auth", { details: `Reset email sent to ${email}` });
    return {};
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("requestPasswordReset error:", msg);
    return { error: "Email service error: " + msg };
  }
}

export async function executePasswordReset(token: string, newPassword: string): Promise<{ error?: string }> {
  if (!token || !newPassword) return { error: "Token and password required" };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };
  const result = await authClient.resetPassword(token, newPassword);
  if (result.error) return { error: result.error };
  logActivity("system", "password_reset", "auth", { details: "Password reset completed" });
  return {};
}

export async function adminResetPassword(adminUserId: string): Promise<{ error?: string }> {
  try {
    const { db } = await import("@/lib/db");
    const { requirePermission } = await import("@/lib/auth/server");
    const admin = await requirePermission("manage_users");

    const rows = await db.query<{ email: string }>(
      "SELECT email FROM public.admin_users WHERE id = $1", [adminUserId]);
    if (rows.length === 0) return { error: "Admin not found" };

    const result = await authClient.requestPasswordReset(rows[0].email);
    if (result.error) return { error: result.error };
    logActivity(admin.email, "admin_password_reset", "auth", { details: `Reset email sent to ${rows[0].email}` });
    return {};
  } catch (e) {
    console.error("adminResetPassword error:", e);
    return { error: "Something went wrong. Try again." };
  }
}
