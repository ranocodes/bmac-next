import { db } from "@/lib/db";
import GalleryForm from "@/components/admin/GalleryForm";

export default async function EditGalleryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("gallery_items", id).catch(() => null);
  return <GalleryForm initialData={item} />;
}
