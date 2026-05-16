"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Mic, BookOpen, Users, Trophy, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import { EmptyState } from "@/components/ui/EmptyState";

// Exported for dynamic routes
export const allPrograms = [
  {
    id: "public-speaking",
    title: "Public Speaking",
    desc: "Build confidence and master the art of compelling delivery through live practice.",
    longDesc: "Our Public Speaking workshop is the cornerstone of the BMAC experience. We take members through a journey from overcoming stage fright to mastering the nuances of rhetorical persuasion. Weekly sessions involve impromptu speaking drills, prepared speech feedback, and workshops on vocal projection and body language.",
    img: "/images/public-speaking.jpg",
    icon: <Mic className="w-6 h-6" />,
    color: "bg-emerald-50 text-emerald-600",
    details: "Every Saturday, 9am-12pm|BMAC Hall, Jos|Open to all members|Facilitated by experts",
  },
  {
    id: "literary-arts",
    title: "Literary & Spoken Word",
    desc: "Explore creative writing and performance in a space that celebrates expression.",
    longDesc: "The Literary Arts program is where pens meet performance. Members explore various forms of creative writing, from traditional poetry and prose to modern spoken word. We focus on storytelling techniques, rhythmic flow, and emotional connection, culminating in regular performance showcases and published anthologies.",
    img: "/images/literary-arts.jpg",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-amber-50 text-amber-600",
    details: "Biweekly Wednesdays, 4pm|Monthly open mics|Quarterly showcases|Annual anthology",
  },
  {
    id: "mentorship",
    title: "Mentorship",
    desc: "Connect with professionals who guide your personal and career development.",
    longDesc: "Our Mentorship program bridges the gap between ambition and experience. We pair members with professionals and BMAC alumni who provide one-on-one guidance on career planning, leadership development, and personal growth. This 6-month commitment ensures meaningful, life-changing connections.",
    img: "/images/mentorship.jpg",
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600",
    details: "Monthly 1-on-1 sessions|Matched by interest|Career focus|6-month minimum",
  },
  {
    id: "competitions",
    title: "Competitions",
    desc: "Test your skills in debates, writing contests, and academic challenges.",
    longDesc: "BMAC Ambassadors are known for their competitive spirit. We organize and participate in regional and national debate championships, creative writing contests, and academic quiz tournaments. These competitions provide high-stakes environments for members to apply the skills they've learned in our workshops.",
    img: "/images/digital-literacy.jpg",
    icon: <Trophy className="w-6 h-6" />,
    color: "bg-rose-50 text-rose-600",
    details: "Inter-school debates|Writing contests|Regional travel|Medals and trophies",
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    desc: "Develop essential digital skills and analytical thinking for the modern world.",
    longDesc: "Our Digital Literacy program ensures that ambassadors are not just confident speakers, but technically proficient leaders. We cover essential tools for research, productivity, and online safety, ensuring our members can navigate the digital landscape with integrity and skill.",
    img: "/images/gallery-hero.jpg",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-indigo-50 text-indigo-600",
    details: "6-week curriculum|Research tools|Online safety|Tech partnerships",
  },
];

export default function Programs() {
  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      <section className="relative min-h-[50dvh] flex items-end pb-12 pt-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-green/5 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0a2e1c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-green font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Leadership Ecosystem
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-deep tracking-tighter leading-[0.9]">
              Our Core <span className="text-gold italic font-light serif">Curriculum</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {allPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allPrograms.map((prog, i) => (
                <FadeIn key={prog.id} delay={i * 0.1}>
                  <Link href={`/programs/${prog.id}`} className="group flex flex-col h-full">
                    <BentoCard className="p-0 overflow-hidden flex flex-col h-full border-none shadow-sm group-hover:shadow-xl transition-all bg-white">
                      <div className="relative h-48 w-full shrink-0">
                        <Image
                          src={prog.img}
                          alt={prog.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-sm">
                          <div className={prog.color}>{prog.icon}</div>
                        </div>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-grow bg-white">
                        <h3 className="font-display text-xl font-bold text-deep mb-3 tracking-tight">
                          {prog.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                          {prog.desc}
                        </p>
                        
                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">View Workshop</span>
                          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green group-hover:text-white transition-colors">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </BentoCard>
                  </Link>
                </FadeIn>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Mic}
              title="Workshops in Development"
              description="We're currently designing new leadership and creative workshops for our next cohort. Secure your place on the waitlist to be notified."
              ctaText="Get Waitlisted"
              ctaHref="/get-involved"
            />
          )}
        </div>
      </section>

      <section className="py-24 px-6 bg-deep overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green rounded-full blur-[120px] opacity-20 -mr-48 -mt-48 pointer-events-none" />
        <FadeIn className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] font-extrabold text-white tracking-tighter mb-8 leading-none">
            Ready to Accelerate <br/> Your <span className="text-gold">Growth</span>?
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-4 bg-white text-deep px-10 py-5 rounded-full font-bold hover:bg-gold transition-all duration-300">
            Join the Next Cohort <ArrowRight size={20} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
