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
      <section className="relative min-h-[60dvh] flex items-center justify-center overflow-hidden pt-20">
        <Image
          src="/images/about-hero.jpg"
          alt="BMAC Jos team"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-secondary/80 backdrop-blur-[2px]" />
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <span className="text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Our Identity
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-card tracking-tighter leading-none">
              Building <span className="text-accent">Ambassadors</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center text-center lg:text-left">
          <FadeIn>
             <div className="section-eyebrow">Our Story</div>
             <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold text-secondary tracking-tighter leading-[1.1] mb-8">
               From a Local Hub <br/> to a <span className="text-primary">National Movement</span>.
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
                <FadeIn delay={0.2} className="relative h-48 lg:h-64 rounded-bento overflow-hidden shadow-sm">
                   <Image src="/images/ws.jpg" alt="Outreach" fill className="object-cover" />
                </FadeIn>
                <FadeIn delay={0.3} className="relative h-40 lg:h-48 rounded-bento overflow-hidden bg-accent p-6 lg:p-8 flex flex-col justify-end shadow-sm">
                   <h4 className="text-secondary font-display font-bold text-lg lg:text-xl leading-tight text-left">100% Youth Led.</h4>
                </FadeIn>
             </div>
             <div className="space-y-4">
                <FadeIn delay={0.4} className="relative h-40 lg:h-48 rounded-bento overflow-hidden bg-secondary p-6 lg:p-8 flex flex-col justify-end shadow-sm text-left">
                   <h4 className="text-secondary-foreground font-display font-bold text-lg lg:text-xl leading-tight">Community Rooted.</h4>
                </FadeIn>
                <FadeIn delay={0.5} className="relative h-48 lg:h-64 rounded-bento overflow-hidden shadow-sm">
                   <Image src="/images/ws1.jpg" alt="Workshop" fill className="object-cover" />
                </FadeIn>
             </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6 text-center md:text-left">
            <div className="max-w-xl">
               <span className="section-eyebrow">The Leadership</span>
               <h2 className="section-title">Meet the Minds Behind BMAC</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs pb-2">
               Our team consists of dedicated professionals and alumni committed to youth development.
            </p>
          </div>
          
          {team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {team.map((member, i) => (
                <motion.div 
                  key={i} 
                  className="group relative aspect-[3/4] rounded-bento overflow-hidden bg-card border border-border shadow-sm"
                  whileHover={{ y: -5 }}
                >
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute bottom-8 left-8 right-8 text-left">
                    <h3 className="text-secondary-foreground font-display text-xl font-bold tracking-tight mb-1">{member.name}</h3>
                    <p className="text-accent font-bold text-[9px] uppercase tracking-[0.2em]">{member.role}</p>
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
      <section className="py-20 bg-secondary text-secondary-foreground overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 text-center relative z-10">
            {impact.map((stat, i) => (
              <div key={i} className="space-y-3">
                <div className="mx-auto w-10 h-10 rounded-xl bg-card/5 flex items-center justify-center text-accent">
                   {getIcon(stat.icon, { size: 20 })}
                </div>
                <h3 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tighter text-secondary-foreground">{stat.num}</h3>
                <p className="text-secondary-foreground/40 text-[10px] lg:text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      <section className="py-24 px-6 bg-accent" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <FadeIn className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-secondary tracking-tighter mb-10 leading-none">
            Join the Network of <br className="hidden sm:block"/> <span className="text-card">Future Leaders</span>.
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-4 bg-secondary text-secondary-foreground px-8 lg:px-10 py-4 lg:py-5 rounded-full font-bold hover:bg-card hover:text-secondary transition-all duration-300 shadow-xl shadow-secondary/10 text-sm lg:text-base">
            Learn How to Participate <ArrowRight size={20} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
