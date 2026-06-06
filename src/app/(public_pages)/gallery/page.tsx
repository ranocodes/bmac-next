import React from "react";
import { mockGallery } from "@/data/mock-data";
import GalleryClient from "./GalleryClient";

export default function GalleryPage() {
  return (
    <main suppressHydrationWarning className="bg-background">
      <GalleryClient galleryItems={mockGallery} />
    </main>
  );
}
