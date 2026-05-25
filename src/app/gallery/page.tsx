import React from "react";
import { getGalleryItems } from "@/lib/cms";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <main suppressHydrationWarning className="bg-background">
      <GalleryClient galleryItems={galleryItems} />
    </main>
  );
}
