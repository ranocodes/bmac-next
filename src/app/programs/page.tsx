"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Mic, BookOpen, Users, Trophy, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";

const programs = [
  {
    id: "public-speaking",
    title: "Public Speaking",
    desc: "Build confidence and master the art of compelling delivery through live practice.",
    img: "/images/public-speaking.jpg",
    icon: <Mic className="w-6 h-6" />,
    color: "bg-emerald-50 text-emerald-600",
    details: "Every Saturday, 9am-12pm|BMAC Hall, Nalado Street|Open to all members|Facilitators: Amina Bello",
  },
  {
    id: "literary",
    title: "Literary & Spoken Word",
    desc: "Explore creative writing and performance in a space that celebrates expression.",
    img: "/images/literary-arts.jpg",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-amber-50 text-amber-600",
    details: "Biweekly Wednesdays, 4pm|Monthly open mics|Quarterly showcases|Published anthologies",
  },
  {
    id: "mentorship",
    title: "Mentorship",
    desc: "Connect with professionals who guide your personal and career development.",
    img: "/images/mentorship.jpg",
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600",
    details: "Monthly 1-on-1s|Matched by interest|Career pathing|6-month minimum commitment",
  },
  {
    id: "competitions",
    title: "Competitions",
    desc: "Test your skills in debates, writing contests, and academic challenges.",
    img: "/images/digital-literacy.jpg",
    icon: <Trophy className="w-6 h-6" />,
    color: "bg-rose-50 text-rose-600",
    details: "Inter-school championships|Writing contests|Quarterly tournaments|Trophies and certificates",
  },
  {
    id: "digital",
    title: "Digital Literacy",
    desc: "Develop essential digital skills and analytical thinking for the modern world.",
    img: "/images/gallery-hero.jpg",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-indigo-50 text-indigo-600",
    details: "Six-week curriculum|Research tools|Online safety|Partnered with Jos Tech Hub",
  },
];

export default function Programs() {
  const [selectedProg, setSelectedProg] = useState<any>(null);

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
              Skill Development
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-deep tracking-tighter leading-[0.9]">
              Programs That <span className="text-gold italic font-light serif">Transform</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* CMS-READY UNIFORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((prog, i) => (
              <BentoCard
                key={prog.id}
                delay={i * 0.1}
                className="p-0 overflow-hidden flex flex-col h-full border-none shadow-sm hover:shadow-xl transition-all bg-white"
                onClick={() => setSelectedProg(prog)}
              >
                {/* Fixed Ratio UX: Image is ~40% of card */}
                <div className="relative h-48 w-full shrink-0">
                  <Image
                    src={prog.img}
                    alt={prog.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-sm">
                    <div className={prog.color}>{prog.icon}</div>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-display text-xl font-bold text-deep mb-3 tracking-tight">
                    {prog.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {prog.desc}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Explore Workshop</span>
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green group-hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Modal */}
      <Modal isOpen={!!selectedProg} onClose={() => setSelectedProg(null)}>
        {selectedProg && (
          <div className="bg-white">
            <div className="relative h-64 md:h-80 w-full">
              <Image src={selectedProg.img} alt={selectedProg.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
            <div className="p-8 md:p-12 -mt-12 relative z-10">
              <span className="text-gold font-bold text-xs uppercase tracking-widest mb-2 block">Workshop Details</span>
              <h2 className="font-display text-4xl font-extrabold text-deep tracking-tight mb-4 leading-none">{selectedProg.title}</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-2xl">{selectedProg.desc}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="font-bold text-deep uppercase text-[10px] tracking-widest">Core Logistics</h4>
                  <ul className="space-y-3">
                    {selectedProg.details.split("|").map((detail: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-8 rounded-[2.5rem] bg-deep text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green rounded-full blur-[60px] opacity-20" />
                   <h4 className="font-display text-xl font-bold mb-6 relative z-10">Registration</h4>
                   <form className="space-y-4 relative z-10" onSubmit={(e) => { e.preventDefault(); alert("Enrolled!"); setSelectedProg(null); }}>
                      <input type="text" placeholder="Full Name" className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" required />
                      <input type="email" placeholder="Email Address" className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all" required />
                      <button className="w-full py-4 bg-gold text-deep font-bold rounded-xl text-sm hover:bg-white transition-all flex items-center justify-center gap-2 mt-4">
                        Enroll Now <Send size={16} />
                      </button>
                   </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <section className="py-24 px-6 bg-deep overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green rounded-full blur-[120px] opacity-20 -mr-48 -mt-48" />
        <FadeIn className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] font-extrabold text-white tracking-tighter mb-8 leading-none">
            Find Your Voice in <br/> a <span className="text-gold">Global Network</span>.
          </h2>
          <Link href="/get-involved" className="inline-flex items-center gap-4 bg-white text-deep px-10 py-5 rounded-full font-bold hover:bg-gold transition-all duration-300">
            Apply Now <ArrowRight size={20} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
