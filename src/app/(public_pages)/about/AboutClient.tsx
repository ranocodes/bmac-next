"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getIcon } from "@/lib/iconMapper";

interface AboutClientProps {
  initialTeam: any[];
  initialStats: any[];
}

export default function AboutClient({ initialTeam, initialStats }: AboutClientProps) {
  const publishedTeam = initialTeam.filter((m: any) => m.status === "published");
  const [team] = useState<any[]>(publishedTeam.length > 0 ? publishedTeam : initialTeam);
  const publishedImpact = initialStats.filter((s: any) => s.status === "published");
  const [impact] = useState<any[]>(publishedImpact.length > 0 ? publishedImpact : initialStats);
  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="bg-background pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
            Our Identity
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary">
            Building Ambassadors.
          </h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center text-center lg:text-left">
          <FadeIn>
             <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Our Story</p>
             <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary tracking-tight mb-8">
               From a Local Hub to a National Movement.
             </h2>
             <div className="space-y-6 text-muted-foreground text-base lg:text-lg leading-relaxed">
                <p>
                  Brilliant Minds Ambassadors Club (BMAC) was founded in Jos, Plateau
                  State by Suleiman Peace Jagaban — a visionary who saw the
                  untapped potential in the youth around him.
                </p>
                <p>
                  What began with five members meeting in a community hall has become
                  a movement of over 350 trained young people. Our ambassadors are now 
                  winning regional championships and leading change across Nigeria.
                </p>
             </div>
          </FadeIn>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-4 pt-6 lg:pt-12">
                <FadeIn delay={0.2} className="relative h-48 lg:h-64 rounded-xl border border-border overflow-hidden">
                   <Image src="/images/ws.jpg" alt="Outreach" fill className="object-cover" />
                </FadeIn>
                <FadeIn delay={0.3} className="relative h-40 lg:h-48 rounded-xl border border-border bg-accent/20 p-6 lg:p-8 flex flex-col justify-end">
                   <h4 className="text-secondary font-display font-bold text-lg lg:text-xl leading-tight text-left">100% Youth Led.</h4>
                </FadeIn>
             </div>
             <div className="space-y-4">
                <FadeIn delay={0.4} className="relative h-40 lg:h-48 rounded-xl border border-border bg-secondary p-6 lg:p-8 flex flex-col justify-end text-left">
                   <h4 className="text-secondary-foreground font-display font-bold text-lg lg:text-xl leading-tight">Community Rooted.</h4>
                </FadeIn>
                <FadeIn delay={0.5} className="relative h-48 lg:h-64 rounded-xl border border-border overflow-hidden">
                   <Image src="/images/ws1.jpg" alt="Workshop" fill className="object-cover" />
                </FadeIn>
             </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
            <div className="max-w-xl">
               <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">The Leadership</p>
               <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-secondary">Meet the Minds Behind BMAC</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs pb-2">
               Our team consists of dedicated professionals and alumni committed to youth development.
            </p>
          </div>
          
          {team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {team.map((member, i) => (
                <motion.div 
                  key={i} 
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border"
                  whileHover={{ y: -4 }}
                >
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <h3 className="text-secondary-foreground font-display text-xl font-bold tracking-tight mb-1">{member.name}</h3>
                    <p className="text-accent font-bold text-[10px] uppercase tracking-widest">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Users}
              title="Building Our Team"
              description="We're currently finalizing our leadership roster for the 2026 academic year. Professional opportunities will be posted here."
              ctaText="Join the Board"
              ctaHref="/get-involved"
            />
          )}
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 bg-card border-y border-border">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 text-center">
            {impact.map((stat, i) => (
              <div key={i} className="space-y-3">
                <div className="mx-auto w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary">
                   {getIcon(stat.icon, { size: 20 })}
                </div>
                <h3 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-secondary">{stat.num}</h3>
                <p className="text-muted-foreground text-[10px] lg:text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      <section className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary mb-10">
            Join the Network of Future Leaders.
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 h-12 rounded-lg font-bold hover:bg-primary/90 transition-colors text-sm">
            Learn How to Participate <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
