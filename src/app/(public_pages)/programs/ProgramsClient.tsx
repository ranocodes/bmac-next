"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import NewsletterModal from "@/components/ui/NewsletterModal";
import type { Program } from "@/types/cms";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMapper";

interface ProgramsClientProps {
  initialPrograms: any[];
}

export default function ProgramsClient({ initialPrograms }: ProgramsClientProps) {
  const [programs] = useState<Program[]>(initialPrograms.map(p => ({
    ...p,
    desc: (p as any).desc || (p as any).description || "",
    img: (p as any).img || (p as any).img_url || "",
    icon: (p as any).icon || (p as any).icon_name || "",
    color: (p as any).color || (p as any).color_class || "",
    skills: (p as any).skills || [],
    faqs: (p as any).faqs || [],
    landingPage: (p as any).landingPage || false,
    status: (p as any).status || "draft",
    isPaid: (p as any).is_paid ?? (p as any).isPaid ?? false,
    price: Number((p as any).price || 0),
  })).filter(p => p.status === "published"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="bg-background pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Leadership Ecosystem
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary mt-2">
            Our Core Programs
          </h1>
          <p className="text-muted-foreground max-w-lg text-base md:text-lg mt-4 leading-relaxed">
            A hands-on set of programs built to turn Jos's brightest minds into confident public speakers and leaders.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {programs.map((prog, i) => (
              <FadeIn key={`${prog.id}-${i}`} delay={i * 0.05}>
                <Link href={`/programs/${prog.id}`} className="group flex flex-col h-full">
                  <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/30">
                    <div className="relative h-48 lg:h-52 w-full shrink-0 border-b border-border/50">
                      <Image
                        src={prog.img}
                        alt={prog.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 p-2 rounded-lg bg-card/90">
                        <div className={cn(prog.color, "w-6 h-6 flex items-center justify-center")}>
                          {getIcon(prog.icon, { size: 24 })}
                        </div>
                      </div>
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${
                        prog.isPaid
                          ? "bg-card/90 text-accent border-accent/30"
                          : "bg-card/90 text-emerald-600 border-emerald-500/30"
                      }`}>
                        {prog.isPaid ? `₦${(prog.price || 0).toLocaleString()}` : "Free"}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-display text-xl font-bold text-secondary tracking-tight">
                        {prog.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mt-2 mb-6 line-clamp-3">
                        {prog.desc}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Learn More</span>
                        <span className="inline-flex items-center gap-1.5 text-primary font-bold group-hover:gap-2.5 transition-all">
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-secondary">
            Ready to Accelerate Your Growth?
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-8 h-12 font-bold hover:bg-primary/90 transition-colors">
            Join the Next Cohort <ArrowRight size={18} />
          </button>
        </div>
      </section>
      
      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Waitlist" />
    </>
  );
}
