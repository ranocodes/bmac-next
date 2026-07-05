"use server";

import { redirect } from "next/navigation";
import { verifySuperAdminCredentials, setSuperAdminSession, clearSuperAdminSession, registerFirstAdmin, createInvite, acceptInvite, getSuperAdminCount } from "@/lib/auth/super-admin";
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
