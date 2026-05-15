"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand, X } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { motion, AnimatePresence } from "framer-motion";

const galleryItems = [
  {
    img: "/images/public-speaking.jpg",
    category: "workshops",
    alt: "Public speaking workshop session",
  },
  {
    img: "/images/literary-arts.jpg",
    category: "workshops",
    alt: "Group discussion during workshop",
  },
  {
    img: "/images/competitions.jpg",
    category: "competitions",
    alt: "Debate competition on stage",
  },
  {
    img: "/images/award1.jpg",
    category: "competitions",
    alt: "Award presentation at competition",
  },
  {
    img: "/images/pre.jpg",
    category: "outreach",
    alt: "Community outreach in rural area",
  },
  {
    img: "/images/ws.jpg",
    category: "outreach",
    alt: "Students at school visit",
  },
  { img: "/images/anu.jpg", category: "events", alt: "Annual BMAC gathering" },
  {
    img: "/images/jj.jpg",
    category: "events",
    alt: "Spoken word performance night",
  },
  {
    img: "/images/digital-literacy.jpg",
    category: "workshops",
    alt: "Writing workshop with facilitator",
  },
  {
    img: "/images/award2.jpg",
    category: "competitions",
    alt: "Winners posing with trophies",
  },
  {
    img: "/images/jb.jpg",
    category: "events",
    alt: "Networking event for members",
  },
  {
    img: "/images/ws1.jpg",
    category: "outreach",
    alt: "Mentorship session at local school",
  },
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
    <main suppressHydrationWarning>
      <section className="page-hero">
        <Image
          src="/images/gallery-hero.jpg"
          alt="BMAC Jos gallery"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-content">
          <h1>Gallery</h1>
        </div>
      </section>

      <section className="story" style={{ paddingBottom: 0 }}>
        <div className="container">
          <FadeIn className="filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </FadeIn>
        </div>
      </section>

      <section
        className="programs"
        style={{ paddingTop: "32px", background: "var(--bg)" }}
      >
        <div className="gallery-grid">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.img}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="gallery-item"
                onClick={() => setSelectedImg(item)}
              >
                <Image
                  src={item.img}
                  alt={item.alt}
                  width={400}
                  height={280}
                  style={{ objectFit: "cover", width: "100%", height: "280px" }}
                />
                <div className="overlay">
                  <Expand size={24} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox active"
            onClick={() => setSelectedImg(null)}
          >
            <button
              className="lightbox-close"
              onClick={() => setSelectedImg(null)}
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImg.img}
                alt={selectedImg.alt}
                width={1200}
                height={800}
                style={{
                  maxWidth: "92vw",
                  maxHeight: "92vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="cta">
        <FadeIn className="cta-inner">
          <div className="section-eyebrow">Be Part of This</div>
          <h2>Want to See Yourself Here?</h2>
          <Link href="/get-involved" className="btn btn-gold">
            Join BMAC <ArrowRight size={18} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
