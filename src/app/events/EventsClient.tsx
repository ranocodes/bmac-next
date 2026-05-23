"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { DigitalPass } from "@/components/ui/DigitalPass";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { EventPass } from "@/types/cms";

interface EventsClientProps {
  events: EventPass[];
}

export default function EventsClient({ events }: EventsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[50dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-primary/5 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Official Calendar
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
              Upcoming <span className="text-accent italic font-light serif">Engagements</span>.
            </h1>
            <p className="text-muted-foreground max-w-lg text-base md:text-lg mt-6 leading-relaxed font-medium">
               Secure your digital entry pass to the next gathering of Jos's brightest minds.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto space-y-32">
          {events.map((event, i) => (
            <FadeIn key={event.id} delay={i * 0.1}>
              <Link href={`/news/events/${event.id}`} className="group relative block">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    <div className="lg:col-span-3 relative">
                       <div className="flex flex-row lg:flex-col items-baseline lg:items-start gap-4">
                          <span className="text-7xl md:text-9xl font-display font-extrabold text-secondary/5 tracking-tighter absolute -top-10 -left-4 lg:-top-16 lg:-left-8 pointer-events-none group-hover:text-primary/10 transition-colors duration-700">
                             0{i + 1}
                          </span>
                          <span className="text-5xl md:text-7xl font-display font-extrabold text-secondary tracking-tighter leading-none relative z-10">
                             {event.date.split(' ')[1].replace(',','')}
                          </span>
                          <span className="text-xl md:text-2xl font-bold text-accent uppercase tracking-[0.2em] relative z-10">
                             {event.date.split(' ')[0]}
                          </span>
                       </div>
                    </div>

                    <div className="lg:col-span-9">
                       <div className="relative group-hover:-translate-y-2 transition-transform duration-700">
                          <div className="bg-card border border-border/50 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-diffused relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />
                             
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 border-b border-border/30 pb-10">
                                <div>
                                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 block">
                                      {event.category}
                                   </span>
                                   <h3 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-secondary leading-none">
                                      {event.title}
                                   </h3>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 shadow-inner">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Reservations Open</span>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium line-clamp-3">
                                   {event.desc}
                                </p>
                                <div className="flex flex-wrap md:justify-end gap-6 md:gap-10">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                                         <Clock size={18} />
                                      </div>
                                      <div>
                                         <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Time</p>
                                         <p className="text-sm font-bold text-secondary">{event.time}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                                         <MapPin size={18} />
                                      </div>
                                      <div>
                                         <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Venue</p>
                                         <p className="text-sm font-bold text-secondary">{event.venue}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="mt-12 flex justify-end">
                                <div className="w-16 h-16 rounded-full bg-secondary text-card flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500 shadow-xl">
                                   <ArrowRight size={28} />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 bg-card border-t border-border/50">
        <div className="max-w-5xl mx-auto">
           <div className="bg-secondary rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
              <div className="relative z-10">
                 <h2 className="font-display text-4xl md:text-6xl font-extrabold text-card tracking-tighter mb-8">
                    Stay <span className="text-accent italic font-light serif">Synchronized</span>.
                 </h2>
                 <p className="text-card/60 text-lg md:text-xl mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                    Import the official BMAC leadership cycle directly into your workspace.
                 </p>
                 <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-10 py-5 rounded-full bg-card/5 border border-card/10 text-card font-bold hover:bg-card/10 transition-all flex items-center gap-3 backdrop-blur-md shadow-xl group">
                       <Calendar size={20} className="text-accent group-hover:scale-110 transition-transform" />
                       Add to Google
                    </button>
                    <button className="px-10 py-5 rounded-full bg-card/5 border border-card/10 text-card font-bold hover:bg-card/10 transition-all flex items-center gap-3 backdrop-blur-md shadow-xl group">
                       <Calendar size={20} className="text-accent group-hover:scale-110 transition-transform" />
                       Add to Apple
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </section>
      
      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Elite List" />
    </>
  );
}
