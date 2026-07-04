"use server";

import { verifySuperAdminCredentials, setSuperAdminSession, clearSuperAdminSession, registerFirstAdmin, createInvite, acceptInvite, getSuperAdminCount } from "@/lib/auth/super-admin";

export async function loginAdmin(email: string, password: string): Promise<{ error?: string }> {
  if (!email || !password) return { error: "Email and password required" };

  const valid = await verifySuperAdminCredentials(email, password);
  if (!valid) return { error: "Invalid credentials" };

  await setSuperAdminSession(email);
  return {};
}

export async function logoutAdmin(): Promise<void> {
  await clearSuperAdminSession();
}

export async function registerFirstAdminAction(email: string, password: string): Promise<{ error?: string }> {
  return registerFirstAdmin(email, password);
}

export async function createInviteAction(email: string, createdById: string): Promise<{ token?: string; error?: string }> {
  return createInvite(email, createdById);
}

export async function acceptInviteAction(token: string, password: string): Promise<{ error?: string }> {
  return acceptInvite(token, password);
}

export async function hasAnyAdmins(): Promise<boolean> {
  const count = await getSuperAdminCount();
  return count > 0;
}
