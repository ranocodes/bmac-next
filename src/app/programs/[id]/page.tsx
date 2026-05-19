"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Send, CheckCircle2, Users, Clock, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { allPrograms } from "../page";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";

export default function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const program = allPrograms.find((p) => p.id === id);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbf9]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-deep">Workshop Not Found</h2>
          <Link href="/programs" className="text-green font-bold">Back to Programs</Link>
        </div>
      </div>
    );
  }

  const otherPathways = allPrograms.filter(p => p.id !== id).slice(0, 3);

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-6 overflow-hidden bg-white text-center md:text-left">
        <div className="absolute inset-0 bg-[#0f6b3e]/5 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0a2e1c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center relative z-10">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/programs" className="hidden lg:inline-flex items-center gap-2 text-slate-400 hover:text-green text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${program.color} shadow-sm hidden md:block`}>
                  {React.cloneElement(program.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <span className="text-gold font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
                  Official BMAC Program
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,8vw,4.5rem)] font-extrabold text-deep tracking-tighter leading-[0.95] mb-6 lg:mb-8">
                {program.title}
              </h1>

              <p className="text-slate-500 text-base md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {program.desc}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative h-[300px] md:h-[450px] lg:h-[500px] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white order-1 lg:order-2"
          >
            <Image src={program.img} alt={program.title} fill className="object-cover" priority />
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          <div className="lg:col-span-7">
            <div className="prose prose-slate lg:prose-lg max-w-none mb-12 md:mb-16 text-center md:text-left">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-deep mb-6">Overview</h3>
              <p className="text-slate-600 text-base md:text-lg leading-[1.8] mb-8">
                {program.longDesc}
              </p>
            </div>

            <div className="mb-12 md:mb-16">
               <h3 className="font-display text-xl md:text-2xl font-bold text-deep mb-8 text-center md:text-left">What You'll Master</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Commanding presence and stage authority",
                    "Advanced rhetorical techniques",
                    "Critical thinking and rapid response",
                    "Emotional connection with any audience",
                    "Professional storytelling frameworks",
                    "Leadership communication strategies"
                  ].map((skill, i) => (
                    <div key={i} className="flex items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
                       <CheckCircle2 className="text-green flex-shrink-0" size={18} />
                       <span className="text-xs md:text-sm font-bold text-slate-700">{skill}</span>
                    </div>
                  ))}
               </div>
            </div>

            <hr className="border-slate-100 mb-12 md:mb-16" />

            <div className="bg-slate-50 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 border border-slate-100 text-center md:text-left">
               <h3 className="font-display text-xl md:text-2xl font-bold text-deep mb-4">Common Questions</h3>
               <div className="space-y-4 text-left">
                  {[
                    { q: "Is this workshop for beginners?", a: "Absolutely. We have specialized modules designed specifically for those starting their journey." },
                    { q: "Are there any fees?", a: "Most BMAC programs are free for active members. Public competitions may have small registration fees." }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                       <p className="font-bold text-deep text-sm md:text-base mb-2">{faq.q}</p>
                       <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-8 md:space-y-12">
            <div className="sticky top-32 space-y-8 md:space-y-12">
               
               {/* Logistics Widget */}
               <div className="bg-deep rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green rounded-full blur-[60px] opacity-20" />
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Workshop <br className="hidden md:block"/> Logistics</h3>
                  
                  <div className="grid grid-cols-1 gap-6 relative z-10">
                    {program.details.split('|').map((detail, i) => (
                      <div key={i} className="flex items-center gap-4 md:gap-5 justify-start">
                         <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold flex-shrink-0">
                            <Clock size={18} />
                         </div>
                         <p className="text-xs md:text-sm font-bold leading-tight">{detail}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* RSVP Form */}
               <div className="bg-white rounded-[2.5rem] p-6 md:p-10 lg:p-12 shadow-2xl border border-slate-100 relative overflow-hidden text-center md:text-left">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-24 -mt-24 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-deep mb-2">Secure Your Spot</h3>
                    <p className="text-slate-400 text-xs md:text-sm mb-8 leading-relaxed">Join the next cohort of ambassadors gathering in Jos.</p>
                    
                    <form className="space-y-4 md:space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Application Sent!"); }}>
                       <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                          <input type="text" placeholder="Ambassador Name" className="w-full px-5 md:px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all" required />
                       </div>
                       <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                          <input type="email" placeholder="email@bmacjos.org" className="w-full px-5 md:px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all" required />
                       </div>
                       <button className="w-full py-4 md:py-5 bg-[#0f6b3e] text-white rounded-xl md:rounded-2xl font-bold hover:bg-[#0a2e1c] transition-all flex items-center justify-center gap-3 shadow-lg shadow-green/10 mt-4 active:scale-[0.98]">
                          Apply to Program <Send size={18} />
                       </button>
                    </form>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Other Growth Pathways */}
      {otherPathways.length > 0 && (
        <section className="py-20 md:py-24 px-6 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto text-center md:text-left">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-deep tracking-tight mb-12">Other Growth Pathways</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPathways.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                      <Link href={`/programs/${item.id}`} className="group block h-full">
                        <BentoCard className="bg-white p-8 h-full flex flex-col items-center md:items-start border-none shadow-sm hover:shadow-lg transition-all">
                            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                              {item.icon}
                            </div>
                            <h3 className="font-display text-lg font-bold text-deep group-hover:text-green transition-colors leading-tight mb-3">
                              {item.title}
                            </h3>
                            <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-2">
                              {item.desc}
                            </p>
                        </BentoCard>
                      </Link>
                  </FadeIn>
                ))}
              </div>
          </div>
        </section>
      )}
    </main>
  );
}
