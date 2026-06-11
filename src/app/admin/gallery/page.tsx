import { db } from "@/lib/db";
import GalleryTable from "@/components/admin/GalleryTable";

export default async function GalleryAdminPage() {
  const items = await db.getAll<any>("gallery_items").catch(() => []);
  return <GalleryTable initialData={items} />;
}
