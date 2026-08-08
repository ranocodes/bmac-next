import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import CategoriesPageClient from "./CategoriesPageClient";

export default async function CategoriesPage() {
  await requirePage("manage_categories");
  const categories = await db.getAll<any>("categories").catch(() => []);
  return <CategoriesPageClient initialData={categories} />;
}
