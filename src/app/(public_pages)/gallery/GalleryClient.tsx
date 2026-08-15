"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand, X } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["all", "workshops", "competitions", "outreach", "events"];

interface GalleryClientProps {
  initialGallery: any[];
}

export default function GalleryClient({ initialGallery }: GalleryClientProps) {
  const [filter, setFilter] = useState("all");
  const [selectedImg, setSelectedImg] = useState<any | null>(null);
  const published = initialGallery.filter((g: any) => g.status === "published");
  const [galleryItems] = useState<any[]>(published.length > 0 ? published : initialGallery);

  const filteredItems =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category?.toLowerCase() === filter);

  return (
    <>
      <section className="bg-background pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Visual Archive</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary">
            Impact in Focus.
          </h1>
        </div>
      </section>

      {/* Non-Sticky Filter Bar */}
      <section className="py-6 border-y border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 justify-center md:justify-start">
           {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors border ${
                  filter === cat 
                    ? "bg-secondary text-secondary-foreground border-secondary" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </section>

      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id || `${item.img}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-[4/5] rounded-xl border border-border overflow-hidden cursor-pointer bg-card"
                  onClick={() => setSelectedImg(item)}
                >
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center text-secondary">
                        <Expand size={20} />
                     </div>
                  </div>
                  <div className="absolute bottom-4 left-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                     <span className="bg-card text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {item.category}
                     </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-secondary/95 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setSelectedImg(null)}
          >
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-8 right-8 z-[2001] w-12 h-12 bg-card/10 text-card rounded-lg flex items-center justify-center border border-card/20"
              onClick={() => setSelectedImg(null)}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video rounded-xl border border-card/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImg.img}
                alt={selectedImg.alt}
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-20 px-6 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-secondary">
            Join the Next Chapter.
          </h2>
          <Link href="/get-involved" className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 h-12 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            Apply Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
