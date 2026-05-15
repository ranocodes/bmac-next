"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Bookmark, Share2, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import { newsData, eventsData } from "../page";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const article = newsData.find((n) => n.id === id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbf9]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <Link href="/news" className="text-green font-bold">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      {/* Editorial Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0a2e1c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/news" className="inline-flex items-center gap-2 text-slate-400 hover:text-green text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Chronicle
              </Link>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-emerald-50 text-green px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {article.category}
                </span>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Calendar size={14} /> {article.date}
                </div>
              </div>

              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold text-deep tracking-tighter leading-[0.95] mb-8">
                {article.title}
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed max-w-2xl italic border-l-4 border-gold pl-6">
                {article.desc}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative h-[400px] md:h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white"
          >
            <Image src={article.img} alt={article.title} fill className="object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Article Text */}
          <article className="lg:col-span-8">
            <div className="prose prose-slate lg:prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-slate-600 text-lg leading-[1.8] mb-8 first-letter:text-5xl first-letter:font-bold first-letter:text-deep first-letter:mr-3 first-letter:float-left">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Engagement Footer */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share this story</span>
                  <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-deep hover:text-white transition-all"><Share2 size={18} /></button>
                     <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-deep hover:text-white transition-all"><Bookmark size={18} /></button>
                  </div>
               </div>
               <Link href="/get-involved" className="text-sm font-bold text-green hover:gap-3 transition-all flex items-center gap-2">
                  Want to be part of the next story? <ArrowLeft size={16} className="rotate-180 text-gold" />
               </Link>
            </div>
          </article>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-32 space-y-12">
               
               {/* Upcoming Contextual Events */}
               <div className="bg-deep rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green rounded-full blur-[60px] opacity-20" />
                  <h3 className="font-display text-2xl font-bold mb-10 relative z-10">Attend an <br/> Upcoming Session</h3>
                  
                  <div className="space-y-8 relative z-10">
                    {eventsData.map((event, i) => (
                      <div key={i} className="group flex gap-5 cursor-pointer">
                         <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center group-hover:bg-gold transition-colors">
                            <span className="text-[9px] font-bold uppercase group-hover:text-deep">{event.date.split(' ')[0].substring(0,3)}</span>
                            <span className="text-sm font-extrabold group-hover:text-deep">{event.date.split(' ')[1].replace(',','')}</span>
                         </div>
                         <div>
                            <h4 className="text-sm font-bold group-hover:text-gold transition-colors leading-tight mb-1">{event.title}</h4>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{event.venue}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/programs" className="block w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-xs font-bold hover:bg-white hover:text-deep transition-all">
                     View All Programs
                  </Link>
               </div>

               {/* Newsletter Integration */}
               <div className="bg-gold rounded-[3rem] p-10 text-deep shadow-xl shadow-amber-900/5">
                  <h3 className="font-display text-2xl font-bold mb-4">Stay Impactful.</h3>
                  <p className="text-deep/70 text-sm leading-relaxed mb-8">
                     Get the latest stories from Jos delivered to your inbox every Friday.
                  </p>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                     <input type="email" placeholder="Your Email" className="w-full px-6 py-4 bg-white/20 border border-deep/10 rounded-2xl text-sm placeholder:text-deep/40 focus:outline-none" required />
                     <button className="w-full py-4 bg-deep text-white rounded-2xl text-sm font-bold shadow-lg">Subscribe Now</button>
                  </form>
               </div>
            </div>
          </aside>
        </div>
      </section>

      {/* More Stories - Dynamic CMS Feel */}
      <section className="py-24 px-6 bg-slate-50/50 border-t border-slate-100">
         <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-extrabold text-deep tracking-tight mb-12">More from the Chronicle</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {newsData.filter(n => n.id !== id).slice(0, 3).map((item, i) => (
                 <FadeIn key={i} delay={i * 0.1}>
                    <Link href={`/news/${item.id}`} className="group block">
                       <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6">
                          <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                       </div>
                       <div className="flex items-center gap-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span className="text-gold">{item.category}</span>
                          <span>{item.date}</span>
                       </div>
                       <h3 className="font-display text-xl font-bold text-deep group-hover:text-green transition-colors leading-tight line-clamp-2">
                          {item.title}
                       </h3>
                    </Link>
                 </FadeIn>
               ))}
            </div>
         </div>
      </section>
    </main>
  );
}
