import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import GalleryForm from "@/components/admin/GalleryForm";

export default async function EditGalleryPage(props: { params: Promise<{ id: string }> }) {
  await requirePage("manage_gallery");
  const { id } = await props.params;
  const item = await db.getById<any>("gallery_items", id).catch(() => null);
  return <GalleryForm initialData={item} />;
}
