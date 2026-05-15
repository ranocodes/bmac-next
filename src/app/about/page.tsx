"use client";

import Image from "next/image";
import Link from "next/link";
import { Target, Eye, Heart, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";

const team = [
  {
    name: "Suleiman Peace Jagaban",
    role: "Founder & Director",
    img: "/images/jagsba.jpg",
  },
  { 
    name: "Amina Bello", 
    role: "Programs Director", 
    img: "/images/maryam.jpg",
  },
  {
    name: "Chinedu Okonkwo",
    role: "Head of Communications",
    img: "/images/anu.jpg",
  },
  {
    name: "Fatima Abdullahi",
    role: "Mentorship Coordinator",
    img: "/images/maryam1.jpg",
  },
];

const impact = [
  { num: "350+", label: "Members Trained", icon: <ShieldCheck size={20}/> },
  { num: "48", label: "Events Hosted", icon: <Zap size={20}/> },
  { num: "12", label: "Community Partners", icon: <Sparkles size={20}/> },
  { num: "8", label: "Awards Won", icon: <Target size={20}/> },
];

export default function About() {
  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      <section className="relative min-h-[60dvh] flex items-center justify-center overflow-hidden pt-20">
        <Image
          src="/images/about-hero.jpg"
          alt="BMAC Jos team"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a2e1c]/80 backdrop-blur-[2px]" />
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <span className="text-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Our Identity
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-white tracking-tighter leading-none">
              Building <span className="text-gold">Ambassadors</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story Section - Responsive Fix */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center text-center lg:text-left">
          <FadeIn>
             <div className="section-eyebrow">Our Story</div>
             <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold text-deep tracking-tighter leading-[1.1] mb-8">
               From a Local Hub <br/> to a <span className="text-green">National Movement</span>.
             </h2>
             <div className="space-y-6 text-slate-500 text-base lg:text-lg leading-relaxed">
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
                <FadeIn delay={0.2} className="relative h-48 lg:h-64 rounded-[2rem] overflow-hidden shadow-sm">
                   <Image src="/images/ws.jpg" alt="Outreach" fill className="object-cover" />
                </FadeIn>
                <FadeIn delay={0.3} className="relative h-40 lg:h-48 rounded-[2rem] overflow-hidden bg-gold p-6 lg:p-8 flex flex-col justify-end shadow-sm">
                   <h4 className="text-deep font-display font-bold text-lg lg:text-xl leading-tight text-left">100% Youth Led.</h4>
                </FadeIn>
             </div>
             <div className="space-y-4">
                <FadeIn delay={0.4} className="relative h-40 lg:h-48 rounded-[2rem] overflow-hidden bg-deep p-6 lg:p-8 flex flex-col justify-end shadow-sm text-left">
                   <h4 className="text-white font-display font-bold text-lg lg:text-xl leading-tight">Community Rooted.</h4>
                </FadeIn>
                <FadeIn delay={0.5} className="relative h-48 lg:h-64 rounded-[2rem] overflow-hidden shadow-sm">
                   <Image src="/images/ws1.jpg" alt="Workshop" fill className="object-cover" />
                </FadeIn>
             </div>
          </div>
        </div>
      </section>

      {/* Foundation Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Core Foundation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <BentoCard className="bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                To identify, train, and empower young people with communication, creative, and critical thinking skills needed to lead with confidence.
              </p>
            </BentoCard>

            <BentoCard className="bg-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <Eye size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                A generation of young African leaders who speak boldly, think critically, and build communities where every voice matters.
              </p>
            </BentoCard>

            <BentoCard className="bg-white">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <Heart size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">Our Values</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Excellence in every session. Inclusivity for all. Integrity in mentorship. Impact measured by real member outcomes.
              </p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Team Grid - Responsive Fix */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6 text-center md:text-left">
            <div className="max-w-xl">
               <span className="section-eyebrow">The Leadership</span>
               <h2 className="section-title">Meet the Minds Behind BMAC</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-xs pb-2">
               Our team consists of dedicated professionals and alumni committed to youth development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {team.map((member, i) => (
              <motion.div 
                key={i} 
                className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm"
                whileHover={{ y: -5 }}
              >
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                <div className="absolute bottom-8 left-8 right-8 text-left">
                  <h3 className="text-white font-display text-xl font-bold tracking-tight mb-1">{member.name}</h3>
                  <p className="text-gold font-bold text-[9px] uppercase tracking-[0.2em]">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 bg-deep text-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16 text-center relative z-10">
            {impact.map((stat, i) => (
              <div key={i} className="space-y-3">
                <div className="mx-auto w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold">
                   {stat.icon}
                </div>
                <h3 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tighter text-white">{stat.num}</h3>
                <p className="text-white/40 text-[10px] lg:text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      <section className="py-24 px-6 bg-gold">
        <FadeIn className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] font-extrabold text-deep tracking-tighter mb-10 leading-none">
            Join the Network of <br className="hidden sm:block"/> <span className="text-white">Future Leaders</span>.
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-4 bg-deep text-white px-8 lg:px-12 py-4 lg:py-6 rounded-full font-bold hover:bg-white hover:text-deep transition-all duration-300 shadow-xl shadow-deep/10 text-sm lg:text-base">
            Learn How to Participate <ArrowRight size={20} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
