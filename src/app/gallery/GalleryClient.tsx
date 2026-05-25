"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand, X } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryItem } from "@/types/cms";

interface GalleryClientProps {
  galleryItems: GalleryItem[];
}

const categories = ["all", "workshops", "competitions", "outreach", "events"];

export default function GalleryClient({ galleryItems }: GalleryClientProps) {
  const [filter, setFilter] = useState("all");
  const [selectedImg, setSelectedImg] = useState<GalleryItem | null>(null);

  const filteredItems =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === filter);

  return (
    <>
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-secondary opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 text-center md:text-left">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Visual Archive</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
                Impact in <span className="text-primary italic font-light serif">Focus</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      {/* Non-Sticky Filter Bar */}
      <section className="py-12 border-b border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 justify-center md:justify-start">
           {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === cat 
                    ? "bg-secondary text-secondary-foreground shadow-lg" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.img}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-[4/5] rounded-bento overflow-hidden cursor-pointer shadow-sm bg-card"
                  onClick={() => setSelectedImg(item)}
                >
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-secondary">
                        <Expand size={20} />
                     </div>
                  </div>
                  <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                     <span className="bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
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
              className="absolute top-8 right-8 z-[2001] w-12 h-12 bg-card/10 text-card rounded-full flex items-center justify-center border border-card/20"
              onClick={() => setSelectedImg(null)}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video rounded-bento overflow-hidden shadow-2xl"
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

      <section className="py-24 px-6 bg-primary" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-primary-foreground tracking-tighter mb-8 leading-none">
            Join the <span className="text-accent">Next Chapter</span>.
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-4 bg-accent text-accent-foreground px-10 py-5 rounded-full font-bold hover:bg-card transition-all duration-300 shadow-xl shadow-accent/10">
            Apply Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
