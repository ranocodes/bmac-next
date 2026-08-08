import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import GalleryTable from "@/components/admin/GalleryTable";

export default async function GalleryAdminPage() {
  await requirePage("manage_gallery");
  const items = await db.getAll<any>("gallery_items").catch(() => []);
  return <GalleryTable initialData={items} />;
}
