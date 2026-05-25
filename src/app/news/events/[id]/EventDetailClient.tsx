"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Send, Clock, Share2, Bookmark, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import type { EventPass } from "@/types/cms";
import { cn } from "@/lib/utils";

interface EventDetailClientProps {
  event: EventPass;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [isReserved, setIsReserved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPending(false);
    setIsReserved(true);
  };

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Editorial Event Hero - Professional Mobile Layout */}
      <section className="relative overflow-hidden bg-secondary pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-primary/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-16">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <Link href="/events" className="inline-flex items-center gap-2 text-accent hover:text-card text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-8 md:mb-12 transition-colors group mx-auto lg:mx-0">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Access All Passes
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 md:mb-8">
                <span className="bg-accent text-accent-foreground px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                  Registration Open
                </span>
                <div className="flex items-center gap-2 text-card/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                  <Calendar size={12} className="text-accent" /> {event.date}
                </div>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,10vw,5.5rem)] font-extrabold text-card tracking-tighter leading-[0.95] md:leading-[0.85] mb-8 md:mb-10 max-w-4xl mx-auto lg:mx-0">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 md:gap-10">
                <div className="flex items-center gap-4 text-card/80">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent shrink-0 shadow-lg">
                    <MapPin size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-40">Location</p>
                     <p className="text-sm md:text-base font-bold leading-tight">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-card/80">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent shrink-0 shadow-lg">
                    <Clock size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-40">Start Time</p>
                     <p className="text-sm md:text-base font-bold leading-tight">{event.time}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Split Screen Detail Area */}
      <section className="py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Narrative Content */}
          <div className="lg:col-span-7">
            <div className="prose prose-slate lg:prose-xl max-w-none mb-20">
              <h3 className="font-display text-4xl font-extrabold text-secondary mb-10 tracking-tight">The Vision</h3>
              <p className="text-muted-foreground text-lg md:text-xl leading-[1.8] mb-12 font-medium">
                {event.longDesc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                 {[
                    "Networking with industry mentors",
                    "Live workshop demonstrations",
                    "Performance showcases",
                    "Interactive Q&A blocks"
                 ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 p-6 rounded-3xl bg-muted/30 border border-border/50 group hover:bg-card transition-colors duration-500">
                       <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} />
                       </div>
                       <span className="font-bold text-secondary text-sm">{feat}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Sticky Booking Island */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
               {!isReserved ? (
                  <motion.div 
                    layoutId="rsvp-card"
                    className="bg-card rounded-[3rem] p-10 md:p-12 shadow-diffused border border-border/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50 -mr-24 -mt-24 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="text-center md:text-left mb-10">
                        <h3 className="font-display text-3xl font-extrabold text-secondary mb-3 tracking-tight">Secure Your Pass</h3>
                        <p className="text-muted-foreground text-sm font-medium">Limited spots available for the 2026 cycle.</p>
                      </div>
                      
                      <form className="space-y-5" onSubmit={handleRSVP}>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Legal Name</label>
                            <input type="text" placeholder="Peace Jagaban" className="w-full px-8 py-5 bg-muted/50 border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" required />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Communications</label>
                            <input type="email" placeholder="peace@bmacjos.org" className="w-full px-8 py-5 bg-muted/50 border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" required />
                         </div>
                         
                         <button 
                           disabled={isPending}
                           className="w-full py-6 bg-secondary text-card rounded-[2rem] font-extrabold text-base hover:bg-primary transition-all flex items-center justify-center gap-4 mt-8 shadow-2xl disabled:opacity-70 active:scale-[0.98]"
                         >
                            {isPending ? (
                              <div className="w-5 h-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>Request Official Pass <Send size={20} /></>
                            )}
                         </button>
                      </form>
                    </div>
                  </motion.div>
               ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary rounded-[3rem] p-12 text-center text-card shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
                    <div className="relative z-10">
                       <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center text-primary mx-auto mb-8 shadow-xl">
                          <CheckCircle2 size={40} />
                       </div>
                       <h3 className="font-display text-3xl font-extrabold mb-4 tracking-tighter">Reservation Confirmed</h3>
                       <p className="text-card/80 text-base mb-10 font-medium leading-relaxed">
                          Your digital pass has been generated. Check your email for the official QR code and entry details.
                       </p>
                       
                       <div className="p-6 bg-card/10 rounded-3xl border border-card/20 backdrop-blur-md mb-8">
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Entry ID</p>
                          <p className="font-mono text-xl font-extrabold text-accent">BMAC-2026-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                       </div>

                       <div className="flex flex-col gap-3">
                          <button className="w-full py-4 bg-card text-primary font-bold rounded-2xl text-sm hover:bg-accent hover:text-secondary transition-all">
                             Add to Calendar
                          </button>
                       </div>
                    </div>
                  </motion.div>
               )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
