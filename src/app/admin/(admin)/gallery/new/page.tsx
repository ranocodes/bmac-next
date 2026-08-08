import GalleryForm from "@/components/admin/GalleryForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewGalleryPage() {
  await requirePage("manage_gallery");
  return <GalleryForm />;
}
