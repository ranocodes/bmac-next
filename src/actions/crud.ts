"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";

export async function createItem(table: string, data: Record<string, unknown>) {
  const admin = await requireAdmin();
  const result = await db.create(table, data);
  const title = (data.title || data.name || result?.id || "item") as string;
  await logActivity(admin.email, "create", table, {
    resourceId: result?.id as string,
    details: `Created ${table.slice(0, -1)} "${String(title).slice(0, 80)}"`,
  });
  return result;
}

export async function updateItem(table: string, id: string, data: Record<string, unknown>) {
  const admin = await requireAdmin();
  const result = await db.update(table, id, data);
  const title = (data.title || data.name || id) as string;
  await logActivity(admin.email, "update", table, {
    resourceId: id,
    details: `Updated ${table.slice(0, -1)} "${String(title).slice(0, 80)}"`,
  });
  return result;
}

export async function deleteItem(table: string, id: string) {
  const admin = await requireAdmin();
  const result = await db.remove(table, id);
  await logActivity(admin.email, "delete", table, {
    resourceId: id,
    details: `Deleted ${table.slice(0, -1)} #${id.slice(0, 12)}`,
  });
  return result;
}
