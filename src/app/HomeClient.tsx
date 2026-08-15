"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { DigitalPass } from "@/components/ui/DigitalPass";
import PartnersSection from "@/components/ui/PartnersSection";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { getIcon } from "@/lib/iconMapper";
import { Program } from "@/types/cms";

function normalizePrograms(raw: any[]): Program[] {
  return raw.map(p => ({
    ...p,
    desc: (p as any).desc || (p as any).description || "",
    img: (p as any).img || (p as any).img_url || "",
    icon: (p as any).icon || (p as any).icon_name || "",
    color: (p as any).color || (p as any).color_class || "",
    landingPage: (p as any).landingPage || false,
    status: (p as any).status || "draft",
  }));
}

interface HomeClientProps {
  initialPrograms: any[];
  initialTestimonials: any[];
  initialStats: any[];
  initialPartners?: any[];
}

export default function HomeClient({ initialPrograms, initialTestimonials, initialStats, initialPartners }: HomeClientProps) {
  const allPrograms = normalizePrograms(initialPrograms);
  const landing = allPrograms.filter(p => p.landingPage && p.status === "published");
  const [programs] = useState<Program[]>(landing.length > 0 ? landing.slice(0, 3) : allPrograms.filter(p => p.status === "published").slice(0, 3));
  const publishedTestimonials = initialTestimonials.filter((t: any) => t.status === "published");
  const [testimonials] = useState<any[]>(publishedTestimonials.length > 0 ? publishedTestimonials : initialTestimonials);
  const publishedStats = initialStats.filter((s: any) => s.status === "published");
  const [stats] = useState<any[]>(publishedStats.length > 0 ? publishedStats : initialStats);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="bg-background pt-32 lg:pt-36 pb-16">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="text-center lg:text-left order-1"
            >
               <span className="block mb-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Brilliant Minds Ambassadors Club
               </span>
               <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary tracking-tight leading-tight lg:leading-[1.05] mb-6">
                  Building the Confident Next Era.
               </h1>
               <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                  Equipping young leaders in Plateau State with public speaking, 
                  literary arts, and digital skills to turn potential into impact.
               </p>
               
               <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <Link href="/get-involved" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 h-12 rounded-lg font-bold hover:bg-primary/90 transition-colors text-sm">
                     Join BMAC <ArrowRight size={18} />
                  </Link>
                  <Link href="/programs" className="inline-flex items-center gap-2 bg-card text-secondary border border-border px-8 h-12 rounded-lg font-bold hover:bg-muted transition-colors text-sm">
                     View Programs
                  </Link>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.15 }}
               className="relative aspect-[4/3] md:aspect-[3/2] rounded-xl border border-border overflow-hidden order-2"
            >
               <Image 
                  src="/images/literary-arts.jpg" 
                  alt="BMAC Members" 
                  fill 
                  priority 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 via-transparent to-transparent" />

               <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md p-4 md:p-6 rounded-lg border border-border grid grid-cols-3 gap-2">
                  {stats.slice(0, 3).map((stat, i) => (
                    <div key={i} className="text-center">
                        <p className="text-base md:text-lg lg:text-xl font-display font-bold text-secondary">{stat.num}</p>
                       <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground leading-tight mt-0.5">{stat.label}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      <section className="py-20 lg:py-24 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
               <div className="max-w-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Our Ecosystem</span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary tracking-tight">
                     Programs That Redefine Possible.
                  </h2>
               </div>
               <Link href="/programs" className="font-bold text-sm text-primary hover:gap-4 transition-all flex items-center gap-2 pb-2">
                  All Programs <ArrowRight size={16} />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
               {programs.slice(0, 3).map((prog, i) => (
                 <DigitalPass 
                    key={prog.id} 
                    className="p-0 overflow-hidden flex flex-col h-full bg-card group"
                    variant="default"
                 >
                    <Link href={`/programs/${prog.id}`} className="flex flex-col h-full">
                      <div className="relative h-48 lg:h-52 w-full overflow-hidden shrink-0 border-b border-border/50">
                         <Image src={prog.img} alt={prog.title} fill className="object-cover" />
                         <div className="absolute top-4 left-4 p-2 rounded-lg bg-card/90">
                            <div className={prog.color}>{getIcon(prog.icon as string, { size: 24 })}</div>
                         </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow bg-card">
                         <h3 className="font-display text-xl font-bold text-secondary tracking-tight">{prog.title}</h3>
                         <p className="text-muted-foreground text-sm leading-relaxed mt-2 mb-6">{prog.desc}</p>
                         <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                             <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Explore Program</span>
                            <span className="inline-flex items-center gap-1.5 text-primary font-bold group-hover:gap-2.5 transition-all">
                               <ArrowRight size={16} />
                            </span>
                         </div>
                      </div>
                    </Link>
                 </DigitalPass>
               ))}
            </div>
         </div>
      </section>

      <section className="py-20 lg:py-24 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 px-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent block mb-2">Success Stories</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-card tracking-tight">
               Ambassadors in Action.
            </h2>
          </div>
          
          <CircularTestimonials
            testimonials={testimonials}
            autoplay={true}
            colors={{
              name: "var(--card)",
              designation: "var(--accent)",
              testimony: "rgba(255,255,255,0.7)",
              arrowBackground: "rgba(255,255,255,0.05)",
              arrowForeground: "var(--card)",
              arrowHoverBackground: "var(--accent)",
            }}
            fontSizes={{
              name: "clamp(1.5rem,4vw,2.25rem)",
              designation: "14px",
              quote: "clamp(0.95rem,3vw,1.25rem)",
            }}
          />
        </div>
      </section>

      <PartnersSection initialPartners={initialPartners} />

      <section className="py-16 lg:py-24 px-6 bg-background">
         <div className="max-w-4xl mx-auto w-full">
            <div className="bg-card border border-border rounded-xl p-8 md:p-12 lg:p-16 text-center">
               <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary tracking-tight mb-4 leading-tight">
                  Ready to Speak Boldly and Lead Fearlessly?
               </h2>
               <p className="text-muted-foreground text-sm lg:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                  Our next 2026 cohort is gathering soon. Secure your place in a 
                  community that pushes you to be your absolute best.
               </p>
               <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 h-12 rounded-lg font-bold hover:bg-primary/90 transition-colors text-sm">
                     Join the Movement
                  </button>
                  <Link href="/contact" className="inline-flex items-center gap-2 bg-card border border-border text-secondary px-8 h-12 rounded-lg font-bold hover:bg-muted transition-colors text-sm">
                     Contact Support
                  </Link>
               </div>
            </div>
         </div>
      </section>

      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Waitlist" />
    </>
  );
}
