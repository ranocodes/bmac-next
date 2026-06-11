"use server";

import { db } from "@/lib/db";

export async function getAdminUsers() {
  return db.query<any>("SELECT id, email, first_name, role, permissions, created_at FROM public.admin_users ORDER BY created_at ASC");
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  return db.update("admin_users", id, { permissions });
}

export async function deleteAdminUser(id: string) {
  return db.remove("admin_users", id);
}
