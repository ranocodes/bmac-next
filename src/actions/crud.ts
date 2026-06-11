"use server";

import { db } from "@/lib/db";

export async function createItem(table: string, data: Record<string, unknown>) {
  return db.create(table, data);
}

export async function updateItem(table: string, id: string, data: Record<string, unknown>) {
  return db.update(table, id, data);
}

export async function deleteItem(table: string, id: string) {
  return db.remove(table, id);
}
