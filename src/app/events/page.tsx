"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Mic, BookOpen, Users, Trophy, Cpu, Clock, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import { DigitalPass } from "@/components/ui/DigitalPass";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { cn } from "@/lib/utils";

export const eventsData = [
  { 
    id: "public-speaking-march-2026",
    date: "March 15, 2026", 
    title: "Public Speaking Workshop", 
    venue: "BMAC Hall, Nalado Street", 
    time: "09:00 AM",
    category: "Workshop",
    desc: "An intensive training session focused on mastering impromptu speaking and commanding the stage with authority.",
    longDesc: "Join us for our monthly intensive workshop where we deep dive into the mechanics of effective communication. This month, we focus on the art of 'The Spontaneous Leader' — learning how to think on your feet and deliver compelling messages under pressure. Whether you are a beginner or looking to refine your expertise, our facilitators will guide you through practical exercises and live feedback sessions."
  },
  { 
    id: "inter-school-debate-april-2026",
    date: "April 2, 2026", 
    title: "Inter-School Debate", 
    venue: "Hillside Hotel, Jos", 
    time: "10:30 AM",
    category: "Competition",
    desc: "A high-stakes debate competition featuring top students from across Plateau State competing for the 2026 Trophy.",
    longDesc: "The BMAC Inter-School Debate Championship returns to Hillside Hotel. This year's competition brings together the brightest minds from across Jos to debate critical issues surrounding technology, governance, and the future of Plateau State. Come and support your school or witness the incredible rhetorical talent of our next generation of leaders."
  },
  { 
    id: "spoken-word-showcase-april-2026",
    date: "April 20, 2026", 
    title: "Spoken Word Showcase", 
    venue: "Museum Auditorium, Jos", 
    time: "04:00 PM",
    category: "Culture",
    desc: "An evening of poetic expression where ambassadors share their voices through powerful performance art.",
    longDesc: "Experience the power of the spoken word at our quarterly showcase. Our ambassadors will take you on a journey of identity, hope, and social commentary. This event is more than a performance; it is a movement that celebrates the rich cultural heritage and vibrant future of Nigerian youth. Admission is free for members and open to the general public with a token registration."
  },
];

export default function Events() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Editorial Hero */}
      <section className="relative min-h-[60dvh] flex items-center justify-center overflow-hidden pt-20 bg-secondary">
        <div className="absolute inset-0 bg-primary/5 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.4em] uppercase bg-card/10 border border-card/20 rounded-full text-accent shadow-xl">
              2026 Engagement Calendar
            </span>
            <h1 className="font-display text-[clamp(3.5rem,12vw,8.5rem)] font-extrabold text-card tracking-tighter leading-[0.85] mb-8">
              The <span className="text-accent italic font-light serif">Pass</span>.
            </h1>
            <p className="text-card/60 max-w-xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
               Your exclusive gateway to leadership workshops, elite competitions, and cultural showcases.
            </p>
          </motion.div>
        </div>
        
        {/* Floating Momentum Decor */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </section>

      {/* Cinematic Events List */}
      <section className="py-24 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto space-y-32">
          {eventsData.map((event, i) => (
            <FadeIn key={event.id} delay={i * 0.1}>
              <Link href={`/news/events/${event.id}`} className="group relative block">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* View-Bleeding Date */}
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

                    {/* Content Banner */}
                    <div className="lg:col-span-9">
                       <div className="relative group-hover:-translate-y-2 transition-transform duration-700 ease-custom">
                          <div className="bg-card border border-border/50 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-diffused relative overflow-hidden">
                             {/* Tactical Background Decor */}
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
                                <div className="flex flex-col items-start md:items-end shrink-0">
                                   <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 shadow-inner">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Reservations Open</span>
                                   </div>
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

      {/* Calendar Sync - Tactical Style */}
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
    </main>
  );
}
