"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { Program } from "@/types/cms";

interface ProgramsClientProps {
  programs: Program[];
}

export default function ProgramsClient({ programs }: { programs: Program[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[50dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-primary/5 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Leadership Ecosystem
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
              Our Core <span className="text-accent italic font-light serif">Curriculum</span>.
            </h1>
            <p className="text-muted-foreground max-w-lg text-base md:text-lg mt-6 leading-relaxed">
               Secure your digital entry pass to the next gathering of Jos's brightest minds.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((prog, i) => (
              <FadeIn key={prog.id} delay={i * 0.1}>
                <Link href={`/programs/${prog.id}`} className="group flex flex-col h-full">
                  <BentoCard className="p-0 overflow-hidden flex flex-col h-full border-none shadow-sm group-hover:shadow-xl transition-all bg-card">
                    <div className="relative h-48 lg:h-56 w-full shrink-0 border-b border-border/50">
                      <Image
                        src={prog.img}
                        alt={prog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 lg:top-6 left-4 lg:left-6 p-2.5 rounded-xl bg-card/90 backdrop-blur-md shadow-sm">
                        <div className={prog.color}>
                          {React.cloneElement(prog.icon as React.ReactElement, { "aria-hidden": "true" } as any)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow bg-card">
                      <h3 className="font-display text-xl lg:text-2xl font-bold text-secondary mb-3 tracking-tight">
                        {prog.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
                        {prog.desc}
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Learn More</span>
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </BentoCard>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 -mr-48 -mt-48 pointer-events-none" />
        <FadeIn className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] font-extrabold text-primary tracking-tighter mb-8 leading-none">
            Ready to Accelerate <br/> Your <span className="text-accent">Growth</span>?
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-4 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold hover:bg-accent hover:text-secondary transition-all duration-300 shadow-xl shadow-secondary/20">
            Join the Next Cohort <ArrowRight size={20} />
          </button>
        </FadeIn>
      </section>
      
      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Waitlist" />
    </>
  );
}
