"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Bookmark, Share2, MapPin, Send, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { newsData, eventsData } from "../page";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const article = newsData.find((n) => n.id === id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <Link href="/news" className="text-primary font-bold">Back to News</Link>
        </div>
      </div>
    );
  }

  const relatedStories = newsData.filter(n => n.id !== id).slice(0, 3);

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Editorial Hero Section - Mobile Optimized */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-6 overflow-hidden bg-card">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center relative z-10">
          <div className="lg:col-span-7 text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/news" className="hidden lg:inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Chronicle
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {article.category}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <Calendar size={14} /> {article.date}
                </div>
              </div>

              <h1 className="font-display text-[clamp(2rem,8vw,4.5rem)] font-extrabold text-secondary tracking-tighter leading-[0.95] mb-6 lg:mb-8">
                {article.title}
              </h1>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 italic border-l-0 lg:border-l-4 border-accent lg:pl-6">
                {article.desc}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative h-[300px] md:h-[450px] lg:h-[500px] rounded-bento overflow-hidden shadow-2xl border-4 md:border-8 border-card order-1 lg:order-2"
          >
            <Image src={article.img} alt={article.title} fill className="object-cover" priority />
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24">
          
          {/* Article Text */}
          <article className="lg:col-span-8">
            <div className="prose prose-slate lg:prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-muted-foreground text-base md:text-lg leading-[1.7] md:leading-[1.8] mb-8 first-letter:text-4xl md:first-letter:text-5xl first-letter:font-bold first-letter:text-secondary first-letter:mr-2 md:first-letter:mr-3 first-letter:float-left">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Engagement Footer */}
            <div className="mt-12 md:mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
               <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Share story</span>
                  <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"><Share2 size={18} /></button>
                     <button className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"><Bookmark size={18} /></button>
                  </div>
               </div>
               <Link href="/get-involved" className="text-xs md:text-sm font-bold text-primary hover:gap-3 transition-all flex items-center gap-2">
                  Be part of the next story <ArrowLeft size={16} className="rotate-180 text-accent" />
               </Link>
            </div>
          </article>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-8 md:space-y-12">
            <div className="lg:sticky lg:top-32 space-y-6 md:space-y-12">
               
               {/* Upcoming Calendar */}
               <div className="bg-secondary rounded-[2rem] md:rounded-bento p-6 md:p-10 text-secondary-foreground relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20" />
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Upcoming <br className="hidden md:block"/> Calendar</h3>
                  
                  {eventsData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 relative z-10">
                      {eventsData.map((event, i) => (
                        <Link href={`/news/events/${event.id}`} key={i} className="group flex gap-4 md:gap-5 justify-start cursor-pointer">
                           <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-card/5 border border-card/10 flex flex-col items-center justify-center group-hover:bg-accent transition-colors">
                                <span className="text-[8px] md:text-[9px] font-bold uppercase group-hover:text-secondary">{event.date.split(' ')[0].substring(0,3)}</span>
                                <span className="text-xs md:text-sm font-extrabold group-hover:text-secondary">{event.date.split(' ')[1].replace(',','')}</span>
                           </div>
                           <div>
                              <h4 className="text-xs md:text-sm font-bold group-hover:text-accent transition-colors leading-tight mb-1">{event.title}</h4>
                              <p className="text-[9px] text-secondary-foreground/40 font-bold uppercase tracking-widest">{event.venue}</p>
                           </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="relative z-10 py-10 text-center border border-dashed border-card/10 rounded-3xl">
                       <Calendar className="mx-auto mb-3 opacity-20" size={24} />
                       <p className="text-xs font-bold text-secondary-foreground/30 uppercase tracking-widest">Clear Calendar</p>
                    </div>
                  )}
                  
                  <Link href="/programs" className="block w-full mt-6 md:mt-10 py-4 bg-card/5 border border-card/10 rounded-2xl text-center text-[10px] font-bold hover:bg-card hover:text-secondary transition-all uppercase tracking-widest">
                     View All Programs
                  </Link>
               </div>

               {/* Newsletter Box */}
               <div className="bg-accent rounded-[2rem] md:rounded-bento p-6 md:p-10 text-accent-foreground shadow-xl text-center md:text-left">
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-4">Stay Notified.</h3>
                  <p className="text-accent-foreground/70 text-xs md:text-sm leading-relaxed mb-8">
                     Get the latest stories from Jos delivered every Friday.
                  </p>
                  <form className="space-y-3 md:space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                     <input type="email" placeholder="Your Email" className="w-full px-5 py-3.5 md:py-4 bg-card/30 border border-accent-foreground/10 rounded-xl text-sm placeholder:text-accent-foreground/40 focus:outline-none" required />
                     <button className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold shadow-lg active:scale-[0.98] transition-transform">Join 500+ Readers</button>
                  </form>
               </div>
            </div>
          </aside>
        </div>
      </section>

      {/* More Stories */}
      {relatedStories.length > 0 && (
        <section className="py-20 md:py-24 px-6 bg-muted/50 border-t border-border">
          <div className="max-w-7xl mx-auto text-center md:text-left">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-secondary tracking-tight mb-12">More from the Chronicle</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {relatedStories.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                      <Link href={`/news/${item.id}`} className="group block">
                        <div className="relative aspect-video rounded-card overflow-hidden mb-6">
                            <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="text-accent">{item.category}</span>
                            <span>{item.date}</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-secondary group-hover:text-primary transition-colors leading-tight line-clamp-2">
                            {item.title}
                        </h3>
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
