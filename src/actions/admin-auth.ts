"use server";

import { verifyPassword, verifySuperAdminEmail, setSuperAdminSession, clearSuperAdminSession } from "@/lib/auth/super-admin";

export async function loginAdmin(email: string, password: string): Promise<{ error?: string }> {
  if (!email || !password) return { error: "Email and password required" };

  if (!verifySuperAdminEmail(email)) return { error: "Invalid credentials" };
  if (!verifyPassword(password)) return { error: "Invalid credentials" };

  await setSuperAdminSession(email);
  return {};
}

export async function logoutAdmin(): Promise<void> {
  await clearSuperAdminSession();
}
