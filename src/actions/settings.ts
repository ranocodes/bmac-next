"use server";

import { db } from "@/lib/db";

export async function getSiteSettings() {
  const rows = await db.getAll<any>("site_settings").catch(() => []);
  return rows.length > 0 ? rows[0] : null;
}

export async function saveSiteSettings(data: Record<string, unknown>) {
  const existing = await db.getAll<any>("site_settings").catch(() => []);
  if (existing.length > 0) {
    return db.update("site_settings", existing[0].id, data);
  }
  return db.create("site_settings", { id: `settings-${Date.now()}`, ...data });
}

export async function updateAdminProfile(email: string, firstName: string) {
  const users = await db.query<any>(
    "SELECT id FROM public.admin_users WHERE email = $1",
    [email]
  );
  if (users.length === 0) return { error: "User not found" };
  await db.update("admin_users", users[0].id, { first_name: firstName });
  return { success: true };
}
