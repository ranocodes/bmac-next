"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";

export async function createItem(table: string, data: Record<string, unknown>) {
  await requireAdmin();
  return db.create(table, data);
}

export async function updateItem(table: string, id: string, data: Record<string, unknown>) {
  await requireAdmin();
  return db.update(table, id, data);
}

export async function deleteItem(table: string, id: string) {
  await requireAdmin();
  return db.remove(table, id);
}
