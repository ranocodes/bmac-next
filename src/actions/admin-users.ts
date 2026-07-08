"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";

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
