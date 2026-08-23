"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import type { Category } from "@/types/cms";

export async function getCategories(): Promise<Category[]> {
  await requireAdmin();
  return db.getAll<Category>("categories", { orderBy: "name", orderDir: "ASC" }).catch(() => []);
}

export interface CategoryUsage {
  id: string;
  name: string;
  usage: number;
}

export async function getCategoriesWithUsage(): Promise<CategoryUsage[]> {
  await requireAdmin();
  const cats = await db.getAll<Category>("categories", { orderBy: "name", orderDir: "ASC" }).catch(() => []);
  const counts = await db.query<{ name: string; count: number }>(
    `SELECT c.id AS name, (
       (SELECT COUNT(*) FROM public.events e WHERE LOWER(e.category) = LOWER(c.name))
     + (SELECT COUNT(*) FROM public.news n WHERE LOWER(n.category) = LOWER(c.name))
     + (SELECT COUNT(*) FROM public.gallery g WHERE LOWER(g.category) = LOWER(c.name))
    )::int AS count
    FROM public.categories c`
  );
  const byName = new Map(counts.map(r => [r.name.toLowerCase(), Number(r.count)]));
  return cats.map(c => ({ id: c.id, name: c.name, usage: byName.get(c.name.toLowerCase()) ?? 0 }));
}

export async function createCategory(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "Name is required." };
    const existing = await db.query("SELECT id FROM public.categories WHERE LOWER(name) = LOWER($1)", [trimmed]);
    if (existing.length > 0) return { success: false, error: "A category with that name already exists." };
    await db.create("categories", { id: `cat-${Date.now()}`, name: trimmed });
    void import("./activity-logs").then(m =>
      m.logActivity(admin.email, "category_create", "categories", { details: `Created category "${trimmed}"` })
    ).catch(() => {});
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create category." };
  }
}

export async function renameCategory(id: string, newName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const trimmed = newName.trim();
    if (!trimmed) return { success: false, error: "Name is required." };
    const current = await db.getById<Category>("categories", id);
    if (!current) return { success: false, error: "Category not found." };
    if (current.name === trimmed) return { success: true };
    const dup = await db.query("SELECT id FROM public.categories WHERE LOWER(name) = LOWER($1) AND id != $2", [trimmed, id]);
    if (dup.length > 0) return { success: false, error: "A category with that name already exists." };

    await db.update("categories", id, { name: trimmed });
    for (const table of ["events", "news", "gallery"]) {
      await db.query(`UPDATE public.${table} SET category = $1 WHERE LOWER(category) = LOWER($2)`, [trimmed, current.name]);
    }
    void import("./activity-logs").then(m =>
      m.logActivity(admin.email, "category_rename", "categories", {
        resourceId: id,
        details: `Renamed category "${current.name}" to "${trimmed}"`,
      })
    ).catch(() => {});
    revalidatePath("/admin/events");
    revalidatePath("/admin/news");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to rename category." };
  }
}

export async function deleteCategory(
  id: string,
  reassignTo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const current = await db.getById<Category>("categories", id);
    if (!current) return { success: false, error: "Category not found." };

    if (reassignTo?.trim()) {
      const target = reassignTo.trim();
      for (const table of ["events", "news", "gallery"]) {
        await db.query(`UPDATE public.${table} SET category = $1 WHERE LOWER(category) = LOWER($2)`, [target, current.name]);
      }
    }

    await db.remove("categories", id);
    void import("./activity-logs").then(m =>
      m.logActivity(admin.email, "category_delete", "categories", {
        resourceId: id,
        details: `Deleted category "${current.name}"${reassignTo?.trim() ? ` (reassigned to "${reassignTo.trim()}")` : ""}`,
      })
    ).catch(() => {});
    revalidatePath("/admin/events");
    revalidatePath("/admin/news");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete category." };
  }
}
