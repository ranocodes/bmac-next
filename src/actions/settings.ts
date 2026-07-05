"use server";

import { db } from "@/lib/db";
import { requireAdmin, requirePermission } from "@/lib/auth/server";
import { getSuperAdminSession, setSuperAdminSession } from "@/lib/auth/super-admin";

export async function getSiteSettings() {
  await requireAdmin();
  const rows = await db.getAll<any>("site_settings").catch(() => []);
  return rows.length > 0 ? rows[0] : null;
}

export async function saveSiteSettings(data: Record<string, unknown>) {
  await requirePermission("access_settings");
  const existing = await db.getAll<any>("site_settings").catch(() => []);
  if (existing.length > 0) {
    return db.update("site_settings", existing[0].id, data);
  }
  return db.create("site_settings", { id: `settings-${Date.now()}`, ...data });
}

export async function updateAdminProfile(email: string, firstName: string) {
  await requireAdmin();
  const session = await getSuperAdminSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await db.query(
      "UPDATE public.super_admins SET first_name = $1 WHERE email = $2",
      [firstName, email]);
  } catch { /* may not exist yet — ok */ }

  const users = await db.query<any>(
    "SELECT id FROM public.admin_users WHERE email = $1", [email]);
  if (users.length > 0) {
    await db.update("admin_users", users[0].id, { first_name: firstName });
  }

  await setSuperAdminSession(email, firstName, session.permissions, session.role);
  return { success: true };
}
