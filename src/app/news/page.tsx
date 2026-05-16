"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Calendar, MapPin, Newspaper, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";
import { EmptyState } from "@/components/ui/EmptyState";

// Exported for use in dynamic routes
export const newsData: any[] = [];

export const eventsData: any[] = [];

export default function News() {
  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-white text-center md:text-left">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0a2e1c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-green font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The BMAC Feed</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-[#0a2e1c] tracking-tighter leading-[0.9]">
                News & <span className="text-gold italic font-light serif">Updates</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            {newsData.length > 0 ? (
              <>
                {/* Featured Article */}
                {newsData.filter(n => n.featured).map((feat, i) => (
                  <FadeIn key={i}>
                    <Link href={`/news/${feat.id}`} className="group block">
                       <div className="relative h-64 md:h-80 lg:h-[500px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden mb-8 shadow-xl">
                          <Image src={feat.img} alt={feat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-green">
                             Featured
                          </div>
                       </div>
                       <div className="max-w-2xl text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                             <span className="text-gold">{feat.category}</span>
                             <div className="w-1 h-1 rounded-full bg-slate-200" />
                             <span>{feat.date}</span>
                          </div>
                          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-deep tracking-tight mb-4 group-hover:text-green transition-colors">
                            {feat.title}
                          </h2>
                          <p className="text-slate-500 text-base leading-relaxed mb-6">
                            {feat.desc}
                          </p>
                          <div className="inline-flex items-center gap-2 font-bold text-sm text-deep group-hover:gap-4 transition-all">
                            Read Full Story <ArrowRight size={16} className="text-gold" />
                          </div>
                       </div>
                    </Link>
                  </FadeIn>
                ))}

                <hr className="border-slate-100" />

                {/* News Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {newsData.filter(n => !n.featured).map((item, i) => (
                     <FadeIn key={i} delay={i * 0.1}>
                        <Link href={`/news/${item.id}`} className="group h-full flex flex-col">
                           <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-6">
                              <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                           </div>
                           <div className="flex items-center gap-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span className="text-gold">{item.category}</span>
                              <span>{item.date}</span>
                           </div>
                           <h3 className="font-display text-xl font-bold text-deep mb-3 leading-tight group-hover:text-green transition-colors">
                              {item.title}
                           </h3>
                           <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mt-auto">
                              {item.desc}
                           </p>
                        </Link>
                     </FadeIn>
                   ))}
                </div>
              </>
            ) : (
              <EmptyState 
                icon={Newspaper}
                title="The Chronicle is Quiet"
                description="Our editorial team is busy crafting new stories and documenting member achievements. Check back shortly for fresh insights."
                ctaText="Notify Me"
                ctaHref="/contact"
              />
            )}
          </div>

          <aside className="lg:col-span-4 space-y-12">
             <div className="sticky top-32 space-y-8 md:space-y-12">
                {/* Upcoming Events */}
                <div className="bg-deep rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green rounded-full blur-[60px] opacity-20" />
                   <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Upcoming <br className="hidden md:block"/> Calendar</h3>
                   
                   {eventsData.length > 0 ? (
                     <div className="space-y-6 relative z-10">
                        {eventsData.map((event, i) => (
                          <Link href={`/news/events/${event.id}`} key={i} className="group flex gap-4 md:gap-5 justify-start cursor-pointer">
                             <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center group-hover:bg-gold transition-colors">
                                <span className="text-[8px] md:text-[9px] font-bold uppercase group-hover:text-deep">{event.date.split(' ')[0].substring(0,3)}</span>
                                <span className="text-xs md:text-sm font-extrabold group-hover:text-deep">{event.date.split(' ')[1].replace(',','')}</span>
                             </div>
                             <div>
                                <h4 className="text-xs md:text-sm font-bold group-hover:text-gold transition-colors leading-tight mb-1">{event.title}</h4>
                                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{event.venue}</p>
                             </div>
                          </Link>
                        ))}
                     </div>
                   ) : (
                     <div className="relative z-10 py-10 text-center border border-dashed border-white/10 rounded-3xl">
                        <Calendar className="mx-auto mb-3 opacity-20" size={24} />
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Clear Calendar</p>
                     </div>
                   )}
                </div>

                <div className="bg-gold rounded-[2.5rem] p-8 md:p-10 text-center md:text-left shadow-xl shadow-amber-900/5">
                   <h3 className="font-display text-xl md:text-2xl font-bold text-deep mb-4">Stay Notified.</h3>
                   <p className="text-deep/70 text-xs md:text-sm leading-relaxed mb-8">Join 500+ readers getting our Friday updates.</p>
                   <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                      <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-white/20 border border-deep/10 rounded-xl text-sm placeholder:text-deep/40 focus:outline-none" required />
                      <button className="w-full py-4 bg-deep text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">Subscribe</button>
                   </form>
                </div>
             </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
