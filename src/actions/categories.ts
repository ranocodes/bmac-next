"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import type { Category } from "@/types/cms";

export async function getCategories(): Promise<Category[]> {
  await requireAdmin();
  return db.getAll<Category>("categories", { orderBy: "name", orderDir: "ASC" }).catch(() => []);
}
