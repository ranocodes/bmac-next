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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Program Not Found</h2>
          <Link href="/programs" className="text-primary font-bold">Back to Curriculum</Link>
        </div>
      </div>
    );
  }

  const otherPathways = allPrograms.filter(p => p.id !== id).slice(0, 3);

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-6 overflow-hidden bg-card text-center md:text-left">
        <div className="absolute inset-0 bg-primary/5 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center relative z-10">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/programs" className="hidden lg:inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${program.color} shadow-sm hidden md:block`}>
                  {React.cloneElement(program.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <span className="text-accent font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
                  Official BMAC Program
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,8vw,4.5rem)] font-extrabold text-secondary tracking-tighter leading-[0.95] mb-6 lg:mb-8">
                {program.title}
              </h1>

              <p className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {program.desc}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative h-[300px] md:h-[450px] lg:h-[500px] rounded-bento overflow-hidden shadow-2xl border-4 md:border-8 border-card order-1 lg:order-2"
          >
            <Image src={program.img} alt={program.title} fill className="object-cover" priority />
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24">
          
          <div className="lg:col-span-7">
            <div className="prose prose-slate lg:prose-lg max-w-none mb-12 md:mb-16 text-center md:text-left">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6">Overview</h3>
              <p className="text-muted-foreground text-base md:text-lg leading-[1.7] md:leading-[1.8] mb-8">
                {program.longDesc}
              </p>
            </div>

            <div className="mb-12 md:mb-16">
               <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-8 text-center md:text-left">What You'll Master</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {[
                    "Commanding presence and stage authority",
                    "Advanced rhetorical techniques",
                    "Critical thinking and rapid response",
                    "Emotional connection with any audience",
                    "Professional storytelling frameworks",
                    "Leadership communication strategies"
                  ].map((skill, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 md:p-5 rounded-xl bg-card border border-border shadow-sm transition-transform hover:-translate-y-1">
                       <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                       <span className="text-[11px] md:text-sm font-bold text-secondary">{skill}</span>
                    </div>
                  ))}
               </div>
            </div>

            <hr className="border-border/50 mb-12 md:mb-16" />

            <div className="bg-muted/50 rounded-[2rem] md:rounded-bento p-6 md:p-12 border border-border text-center md:text-left">
               <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-4">Common Questions</h3>
               <div className="space-y-3 md:space-y-4 text-left">
                  {[
                    { q: "Is this workshop for beginners?", a: "Absolutely. We have specialized modules designed specifically for those starting their journey." },
                    { q: "Are there any fees?", a: "Most BMAC programs are free for active members. Public competitions may have small registration fees." }
                  ].map((faq, i) => (
                    <div key={i} className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
                       <p className="font-bold text-secondary text-sm md:text-base mb-2">{faq.q}</p>
                       <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6 md:space-y-12">
            <div className="lg:sticky lg:top-32 space-y-6 md:space-y-12">
               
               {/* Logistics Widget */}
               <div className="bg-secondary rounded-[2rem] md:rounded-bento p-6 md:p-10 text-secondary-foreground relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20" />
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Workshop <br className="hidden md:block"/> Logistics</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 relative z-10">
                    {program.details.split('|').map((detail, i) => (
                      <div key={i} className="flex items-center gap-4 md:gap-5 justify-start">
                         <div className="w-10 h-10 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent flex-shrink-0">
                            <Clock size={18} />
                         </div>
                         <p className="text-xs md:text-sm font-bold leading-tight">{detail}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* RSVP Form */}
               <div className="bg-card rounded-[2rem] md:rounded-bento p-6 md:p-10 lg:p-12 shadow-2xl border border-border relative overflow-hidden text-center md:text-left">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50 -mr-24 -mt-24 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-2">Secure Your Spot</h3>
                    <p className="text-muted-foreground text-xs md:text-sm mb-8 leading-relaxed">Join the next cohort of ambassadors gathering in Jos.</p>
                    
                    <form className="space-y-4 md:space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Application Sent!"); }}>
                       <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                          <input type="text" placeholder="Ambassador Name" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                       </div>
                       <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                          <input type="email" placeholder="email@bmacjos.org" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                       </div>
                       <button className="w-full py-4 md:py-5 bg-primary text-primary-foreground rounded-xl md:rounded-2xl font-bold hover:bg-secondary transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/10 mt-4 active:scale-[0.98]">
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
        <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto text-center md:text-left">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-secondary tracking-tight mb-12">Other Growth Pathways</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {otherPathways.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                      <Link href={`/programs/${item.id}`} className="group block h-full">
                        <BentoCard className="bg-card p-8 h-full flex flex-col items-center border-none shadow-sm hover:shadow-lg transition-all rounded-[2rem]">
                            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-6 shrink-0`}>
                              {item.icon}
                            </div>
                            <h3 className="font-display text-lg font-bold text-secondary group-hover:text-primary transition-colors leading-tight mb-3 text-center">
                              {item.title}
                           </h3>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2 text-center">
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
