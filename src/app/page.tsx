"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mic, BookOpen, Users, Send, Target, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { BentoCard } from "@/components/ui/BentoCard";
import { DigitalPass } from "@/components/ui/DigitalPass";
import NewsletterModal from "@/components/ui/NewsletterModal";

const stats = [
  { num: "350\u00A0+", label: "Members Trained", icon: <Target size={18} aria-hidden="true" /> },
  { num: "48", label: "Events Hosted", icon: <Zap size={18} aria-hidden="true" /> },
  { num: "12", label: "Partners", icon: <Sparkles size={18} aria-hidden="true" /> },
];

const programs = [
  {
    id: "public-speaking",
    title: "Public Speaking",
    desc: "From nervous beginners to confident room-commanding speakers.",
    icon: <Mic size={20} aria-hidden="true" />,
    color: "bg-emerald-50 text-emerald-600",
    img: "/images/public-speaking.jpg",
    details: "Weekly practice|Live feedback|Real stages|Saturday 9am",
  },
  {
    id: "literary",
    title: "Literary Arts",
    desc: "A safe space where young voices learn to paint with words.",
    icon: <BookOpen size={20} aria-hidden="true" />,
    color: "bg-amber-50 text-amber-600",
    img: "/images/literary-arts.jpg",
    details: "Creative writing|Poetry slams|Anthologies|Open Mic nights",
  },
  {
    id: "mentorship",
    title: "Mentorship",
    desc: "One-on-one pairing with industry leaders for career growth.",
    icon: <Users size={20} aria-hidden="true" />,
    color: "bg-blue-50 text-blue-600",
    img: "/images/mentorship.jpg",
    details: "1-on-1 sessions|Career pathing|6-month program|Expert alumni",
  },
];

const testimonialData = [
  {
    quote: "Before BMAC, I could barely stand in front of five people. Now I moderate panel discussions across Jos.",
    name: "Ifeoma Nwosu",
    designation: "2025 Cohort Lead",
    src: "/images/unknown.jpg",
  },
  {
    quote: "The mentorship program paired me with a professional who helped me navigate my career in digital arts.",
    name: "Anu Bello",
    designation: "Creative Arts Lead",
    src: "/images/anu.jpg",
  },
  {
    quote: "Joining the workshops gave me the confidence to share my poetry with the world. I've found my voice.",
    name: "Maryam Sani",
    designation: "Spoken Word Poet",
    src: "/images/maryam.jpg",
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="relative min-h-[90dvh] lg:min-h-[95dvh] flex items-center overflow-hidden pt-28 lg:pt-20 pb-12">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
         
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="text-center lg:text-left order-1"
            >
               <span className="inline-block px-4 py-1.5 mb-6 lg:mb-8 text-[10px] font-bold tracking-[0.3em] uppercase bg-primary/5 border border-primary/10 rounded-full text-primary">
                  Brilliant Minds ambassadors club
               </span>
               <h1 className="font-display text-[clamp(2.25rem,10vw,5.5rem)] font-extrabold text-secondary tracking-tighter leading-[0.95] lg:leading-[0.9] mb-6 lg:mb-8">
                  Building the <br/> <span className="text-primary italic font-light serif">Confident</span> <br/> Next Era.
               </h1>
               <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 lg:mb-10">
                  Equipping young leaders in Plateau State with public speaking, 
                  literary arts, and digital skills to turn potential into impact.
               </p>
               
               <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link href="/get-involved" className="bg-secondary text-secondary-foreground px-8 lg:px-10 py-4 lg:py-5 rounded-full font-bold hover:bg-primary transition-all shadow-xl shadow-secondary/10 flex items-center gap-3 text-sm lg:text-base">
                     Join BMAC <ArrowRight size={20} />
                  </Link>
                  <Link href="/programs" className="bg-card text-secondary border border-border px-8 lg:px-10 py-4 lg:py-5 rounded-full font-bold hover:bg-muted transition-all text-sm lg:text-base">
                     View Programs
                  </Link>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, delay: 0.2 }}
               className="relative h-[350px] md:h-[450px] lg:h-[600px] rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-4 lg:border-8 border-white order-2"
            >
               <Image 
                  src="/images/literary-arts.jpg" 
                  alt="BMAC Members" 
                  fill 
                  priority 
                  className="object-cover" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent" />

               <div className="absolute bottom-4 lg:bottom-10 left-4 lg:left-10 right-4 lg:left-10 bg-card/90 backdrop-blur-xl p-6 lg:p-8 rounded-card lg:rounded-bento border border-card/20 flex justify-between items-center gap-2">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center flex-1">
                       <p className="text-lg lg:text-2xl font-display font-extrabold text-secondary">{stat.num}</p>
                       <p className="text-[7px] lg:text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{stat.label}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      <section className="py-24 lg:py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 lg:mb-20 gap-6 lg:gap-8 text-center md:text-left">
               <div className="max-w-2xl">
                  <span className="text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Ecosystem</span>
                  <h2 className="font-display text-[clamp(1.75rem,6vw,3.5rem)] font-extrabold text-secondary tracking-tighter leading-none">
                     Workshops That <span className="text-primary">Redefine</span> Possible.
                  </h2>
               </div>
               <Link href="/programs" className="font-bold text-sm text-primary hover:gap-4 transition-all flex items-center gap-2 pb-2">
                  All Workshops <ArrowRight size={16} />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
               {programs.map((prog, i) => (
                 <DigitalPass 
                    key={prog.id} 
                    className="p-0 overflow-hidden flex flex-col h-full bg-card group border-none"
                 >
                    <Link href={`/programs/${prog.id}`} className="flex flex-col h-full">
                      <div className="relative h-48 lg:h-56 w-full overflow-hidden shrink-0 border-b border-border/50">
                         <Image src={prog.img} alt={prog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute top-4 lg:top-6 left-4 lg:left-6 p-2.5 rounded-xl bg-card/90 backdrop-blur-md shadow-sm z-20">
                            <div className={prog.color}>{React.cloneElement(prog.icon as React.ReactElement, { "aria-hidden": "true" } as any)}</div>
                         </div>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-grow bg-card">
                         <h3 className="font-display text-xl lg:text-2xl font-bold text-secondary mb-3 tracking-tight">{prog.title}</h3>
                         <p className="text-muted-foreground text-sm leading-relaxed mb-8">{prog.desc}</p>
                         <div className="mt-auto pt-6 border-t border-border/50 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Claim Pass</span>
                            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                               <ArrowRight size={18} />
                            </div>
                         </div>
                      </div>
                    </Link>
                 </DigitalPass>
               ))}
            </div>
         </div>
      </section>

      <section className="py-24 lg:py-32 px-6 bg-secondary overflow-hidden relative text-center md:text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-10 -mr-48 -mt-48 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 lg:mb-20 px-4">
            <span className="text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Success Stories</span>
            <h2 className="font-display text-[clamp(1.75rem,6vw,3.5rem)] font-extrabold text-card tracking-tighter">
               Ambassadors in <span className="text-accent italic font-light serif">Action</span>.
            </h2>
          </div>
          
          <CircularTestimonials
            testimonials={testimonialData}
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

      <section className="py-24 lg:py-32 px-6 bg-background">
         <div className="max-w-5xl mx-auto w-full">
            <BentoCard className="bg-primary p-10 md:p-16 lg:p-24 text-center relative overflow-hidden border-none shadow-2xl shadow-primary/20">
               <div className="absolute top-0 left-0 w-64 h-64 bg-card/5 rounded-full blur-3xl pointer-events-none" />
               <div className="relative z-10">
                  <h2 className="font-display text-[clamp(1.75rem,6vw,4rem)] font-extrabold text-card tracking-tighter mb-6 lg:mb-8 leading-tight">
                     Ready to <span className="text-accent">Speak Boldly</span> <br className="hidden sm:block"/> and Lead Fearlessly?
                  </h2>
                  <p className="text-primary-foreground text-base lg:text-lg mb-8 lg:mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed">
                     Our next 2026 cohort is gathering soon. Secure your place in a 
                     community that pushes you to be your absolute best.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                     <button onClick={() => setIsModalOpen(true)} className="bg-accent text-accent-foreground px-10 lg:px-14 py-4 lg:py-6 rounded-full font-bold hover:bg-card transition-all shadow-xl shadow-accent/10 text-sm lg:text-base">
                        Join the Movement
                     </button>
                     <Link href="/contact" className="bg-card/10 backdrop-blur-md border border-card/20 text-card px-10 lg:px-14 py-4 lg:py-6 rounded-full font-bold hover:bg-card/20 transition-all text-sm lg:text-base">
                        Contact Support
                     </Link>
                  </div>
               </div>
            </BentoCard>
         </div>
      </section>

      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Waitlist" />
    </main>
  );
}
