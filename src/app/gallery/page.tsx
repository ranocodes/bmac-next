"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand, X, Camera } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/ui/EmptyState";

const galleryItems = [
  { img: "/images/public-speaking.jpg", category: "workshops", alt: "Public speaking workshop session" },
  { img: "/images/literary-arts.jpg", category: "workshops", alt: "Group discussion during workshop" },
  { img: "/images/competitions.jpg", category: "competitions", alt: "Debate competition on stage" },
  { img: "/images/award1.jpg", category: "competitions", alt: "Award presentation at competition" },
  { img: "/images/pre.jpg", category: "outreach", alt: "Community outreach in rural area" },
  { img: "/images/ws.jpg", category: "outreach", alt: "Students at school visit" },
  { img: "/images/anu.jpg", category: "events", alt: "Annual BMAC gathering" },
  { img: "/images/jj.jpg", category: "events", alt: "Spoken word performance night" },
  { img: "/images/digital-literacy.jpg", category: "workshops", alt: "Writing workshop with facilitator" },
  { img: "/images/award2.jpg", category: "competitions", alt: "Winners posing with trophies" },
  { img: "/images/jb.jpg", category: "events", alt: "Networking event for members" },
  { img: "/images/ws1.jpg", category: "outreach", alt: "Mentorship session at local school" },
];

const categories = ["all", "workshops", "competitions", "outreach", "events"];

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [selectedImg, setSelectedImg] = useState<any>(null);

  const filteredItems =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === filter);

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-deep opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0a2e1c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 text-center md:text-left">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Visual Archive</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-[#0a2e1c] tracking-tighter leading-[0.9]">
                Impact in <span className="text-green italic font-light serif">Focus</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      {/* Non-Sticky Filter Bar */}
      <section className="py-12 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 justify-center md:justify-start">
           {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === cat 
                    ? "bg-deep text-white shadow-lg" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredItems.length > 0 ? (
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
                    className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer shadow-sm bg-white"
                    onClick={() => setSelectedImg(item)}
                  >
                    <Image
                      src={item.img}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-deep/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-deep">
                          <Expand size={20} />
                       </div>
                    </div>
                    <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                       <span className="bg-gold text-deep text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          {item.category}
                       </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState 
              icon={Camera}
              title="Moments in the Making"
              description="We haven't uploaded any photos to this category yet. Our media team is busy documenting our latest sessions."
              ctaText="View All Photos"
              ctaHref="#" // In a real app, this would reset the filter
            />
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-deep/95 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setSelectedImg(null)}
          >
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-8 right-8 z-[2001] w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center border border-white/20"
              onClick={() => setSelectedImg(null)}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl"
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

      <section className="py-24 px-6 bg-deep">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-8 leading-none">
            Join the <span className="text-gold">Next Chapter</span>.
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-4 bg-gold text-deep px-10 py-5 rounded-full font-bold hover:bg-white transition-all duration-300 shadow-xl shadow-gold/10">
            Apply Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
