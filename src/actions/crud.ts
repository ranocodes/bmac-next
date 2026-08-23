"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import { slugify } from "@/lib/slug";
import { logActivity } from "./activity-logs";

async function uniqueSlug(table: string, title: string, excludeId: string | null): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  for (let i = 2; ; i++) {
    const dup = await db.query("SELECT id FROM public." + table + " WHERE slug = $1", [candidate]);
    if (dup.length === 0 || (excludeId && dup.every((r) => (r as { id: string }).id === excludeId))) break;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

export async function createItem(table: string, data: Record<string, unknown>) {
  const admin = await requireAdmin();
  if (table === "events" && data.status === "published" && data.allow_public_registration === undefined) {
    data.allow_public_registration = true;
  }
  if (table === "programs" && data.status === "published" && data.applications_open === undefined) {
    data.applications_open = true;
  }
  if ((table === "news_articles" || table === "events") && !data.slug) {
    data.slug = await uniqueSlug(table, String(data.title || ""), null);
  }
  const result = await db.create(table, data);
  const title = (data.title || data.name || result?.id || "item") as string;
  void logActivity(admin.email, "create", table, {
    resourceId: result?.id as string,
    details: `Created ${table.slice(0, -1)} "${String(title).slice(0, 80)}"`,
  }).catch(() => {});
  return result;
}

export async function updateItem(table: string, id: string, data: Record<string, unknown>) {
  const admin = await requireAdmin();
  if (table === "events" && data.status === "published" && data.allow_public_registration === undefined) {
    data.allow_public_registration = true;
  }
  if (table === "programs" && data.status === "published" && data.applications_open === undefined) {
    data.applications_open = true;
  }
  const result = await db.update(table, id, data);
  const title = (data.title || data.name || id) as string;
  void logActivity(admin.email, "update", table, {
    resourceId: id,
    details: `Updated ${table.slice(0, -1)} "${String(title).slice(0, 80)}"`,
  }).catch(() => {});
  return result;
}

export async function deleteItem(table: string, id: string) {
  const admin = await requireAdmin();
  const result = await db.remove(table, id);
  void logActivity(admin.email, "delete", table, {
    resourceId: id,
    details: `Deleted ${table.slice(0, -1)} #${id.slice(0, 12)}`,
  }).catch(() => {});
  return result;
}
