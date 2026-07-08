import { db } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const gallery = await db.getAll<any>("gallery_items", { orderBy: "created_at", orderDir: "DESC" });
  return (
    <main suppressHydrationWarning className="bg-background">
      <GalleryClient initialGallery={gallery || []} />
    </main>
  );
}
