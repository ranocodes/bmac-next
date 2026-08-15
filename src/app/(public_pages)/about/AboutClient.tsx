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
      <section className="relative min-h-[68vh] lg:min-h-[82vh] flex items-center lg:items-end overflow-hidden">
        <Image
          src="/images/about-hero.jpg"
          alt="BMAC community in Jos"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-secondary/75" />

        {/* Mobile & tablet: v1 hero — centered title over image */}
        <div className="relative w-full max-w-7xl mx-auto px-6 py-24 text-center lg:hidden">
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            About Us
          </h1>
        </div>

        {/* Desktop: glass card */}
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-16 lg:pb-24 hidden lg:block">
          <FadeIn className="max-w-2xl">
            <div className="rounded-3xl p-12 border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl">
              <span className="inline-block text-accent text-[11px] font-bold uppercase tracking-widest mb-3">
                Our Identity
              </span>
              <h1 className="font-display text-6xl font-bold tracking-tight text-white leading-[1.05]">
                Building Ambassadors.
              </h1>
              <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-lg">
                A movement turning young people in Jos into confident leaders,
                communicators, and changemakers across Nigeria.
              </p>
            </div>
          </FadeIn>
        </div>

        <div aria-hidden className="absolute bottom-0 inset-x-0 h-20 lg:h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile & tablet: v1 centered story */}
          <div className="lg:hidden max-w-[760px] mx-auto text-center">
            <FadeIn>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Our Story</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary tracking-tight mb-8">
                Where It All Began
              </h2>
              <div className="space-y-5 text-left text-muted-foreground leading-[1.8] text-[1.05rem]">
                <p>
                  Brilliant Minds Ambassadors Club (BMAC) was founded in Jos, Plateau
                  State by Suleiman Peace Jagaban — a young leader who saw the
                  untapped potential in the youth around him. Starting as a small
                  weekly gathering focused on building confidence through public
                  speaking, BMAC has grown into one of the most active youth
                  development organizations in northern Nigeria.
                </p>
                <p>
                  What began with five members meeting in a community hall has become
                  a movement of over 350 trained young people across Plateau State.
                  Our members have gone on to win regional debate championships,
                  publish their creative writing, lead school clubs, and launch
                  community initiatives that reach thousands.
                </p>
                <p>
                  BMAC's long-term vision is to establish a network of youth
                  empowerment centers across every major city in northern Nigeria —
                  each one serving as a launchpad for young people to discover their
                  voice, develop their skills, and lead meaningful change in their
                  communities.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Desktop: split with photo bento */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-20 items-center lg:text-left">
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

            <div className="relative pt-12">
               <div aria-hidden className="absolute -top-4 -left-4 w-full h-full rounded-3xl border border-primary/25" />
               <div className="relative grid grid-cols-12 gap-5">
                  <FadeIn className="col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden border border-border shadow-xl">
                     <Image
                        src="/images/ws.jpg"
                        alt="BMAC outreach workshop in session"
                        fill
                        priority
                        sizes="(min-width:1024px) 42vw, 92vw"
                        className="object-cover transition-transform duration-700 hover:scale-105"
                     />
                  </FadeIn>
                  <FadeIn delay={0.2} className="col-span-5 relative aspect-[4/5] mt-12 rounded-2xl overflow-hidden border border-border shadow-xl">
                     <Image
                        src="/images/ws1.jpg"
                        alt="A young ambassador during a workshop"
                        fill
                        sizes="(min-width:1024px) 26vw, 92vw"
                        className="object-cover"
                     />
                  </FadeIn>
               </div>
               <FadeIn delay={0.3} className="relative z-10 flex flex-wrap gap-3 -mt-8">
                  <span className="bg-secondary text-secondary-foreground rounded-xl px-5 py-3 font-display font-bold text-sm leading-tight shadow-lg">100% Youth Led.</span>
                  <span className="bg-background text-secondary border border-border rounded-xl px-5 py-3 font-display font-bold text-sm leading-tight shadow-lg">Community Rooted.</span>
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
