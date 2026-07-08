import { db } from "@/lib/db";
import CategoriesPageClient from "./CategoriesPageClient";

export default async function CategoriesPage() {
  const categories = await db.getAll<any>("categories").catch(() => []);
  return <CategoriesPageClient initialData={categories} />;
}
