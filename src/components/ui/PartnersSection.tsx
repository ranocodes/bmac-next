"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAll, seedIfEmpty } from "@/data/store";
import { mockPartners } from "@/data/mock-data";
import { Case } from "@/components/ui/cases-with-infinite-scroll";
import type { Partner } from "@/types/cms";

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    seedIfEmpty("partners", mockPartners);
    const stored = getAll<Partner>("partners")
      .filter(p => p.status !== "hidden")
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    setPartners(stored.length > 0 ? stored : mockPartners);
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6 md:mb-8"
        >
          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/50 mb-3">
            Trusted by
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary tracking-tight">
            Partner Organizations
          </h2>
        </motion.div>
        <Case partners={partners} hideHeading />
      </div>
    </section>
  );
}
