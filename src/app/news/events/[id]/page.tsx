"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Send, Clock, Share2, Bookmark, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { eventsData } from "../../page";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";

export default function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const event = eventsData.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbf9]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-deep">Event Not Found</h2>
          <Link href="/news" className="text-green font-bold">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      {/* Event Header Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-white text-center md:text-left">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0a2e1c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center relative z-10">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/news" className="inline-flex items-center gap-2 text-slate-400 hover:text-green text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to News & Calendar
              </Link>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <div className="bg-amber-50 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100/50">
                  Upcoming Event
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Calendar size={14} /> {event.date}
                </div>
              </div>

              <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold text-deep tracking-tighter leading-[0.95] mb-8">
                {event.title}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-green shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <span className="text-sm font-bold">{event.venue}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-green shadow-sm">
                    <Clock size={20} />
                  </div>
                  <span className="text-sm font-bold">{event.time}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-4 relative"
          >
             <div className="bg-deep rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden aspect-square flex flex-col justify-between border-8 border-white mx-auto max-w-[320px] md:max-w-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green rounded-full blur-[60px] opacity-20" />
                <div className="relative z-10 text-left">
                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Ambassador Event</p>
                   <p className="text-4xl font-display font-extrabold leading-none">{event.date.split(' ')[1].replace(',','')}</p>
                   <p className="text-xl font-bold text-white/40 uppercase tracking-widest">{event.date.split(' ')[0]}</p>
                </div>
                <div className="relative z-10 pt-10 border-t border-white/10 text-left">
                   <p className="text-[10px] font-bold leading-relaxed mb-4 opacity-60 uppercase tracking-widest">Entry Pass No.</p>
                   <div className="w-full h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between px-4">
                      <span className="text-[10px] font-mono opacity-40">BMAC-EVT-2026-X</span>
                      <Share2 size={14} className="opacity-40" />
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Event Details Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-7">
            <div className="prose prose-slate lg:prose-lg max-w-none mb-16 text-center md:text-left">
              <h3 className="font-display text-3xl font-bold text-deep mb-6">About the Event</h3>
              <p className="text-slate-600 text-lg leading-[1.8] mb-8">
                {event.longDesc}
              </p>
            </div>

            <div className="mb-16">
               <h3 className="font-display text-2xl font-bold text-deep mb-8 text-center md:text-left">Event Highlights</h3>
               <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Networking with guest mentors",
                    "Live workshop demonstrations",
                    "Member performance showcases",
                    "Interactive Q&A sessions",
                    "Certification credits",
                    "Complimentary refreshments"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
                       <CheckCircle2 className="text-green flex-shrink-0" size={18} />
                       <span className="text-xs md:text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Venue Map */}
            <div className="relative h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-xl mb-16">
               <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31226.39734639848!2d8.8721!3d9.9280!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104b42f0c5e0e7e7%3A0x1e2e2e2e2e2e2e2e!2sJos%2C%20Plateau%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1714600000000!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-12">
            <div className="sticky top-32 space-y-12">
               
               <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden text-center md:text-left">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-24 -mt-24 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="font-display text-2xl font-bold text-deep mb-2">RSVP Now</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Limited seats available. Confirm your attendance.</p>
                    
                    <form className="space-y-4 md:space-y-6" onSubmit={(e) => { e.preventDefault(); alert("RSVP Confirmed!"); }}>
                       <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                          <input type="text" placeholder="Your Name" className="w-full px-5 md:px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all" required />
                       </div>
                       <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                          <input type="email" placeholder="email@bmacjos.org" className="w-full px-5 md:px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all" required />
                       </div>
                       <button className="w-full py-5 bg-deep text-white rounded-xl md:rounded-2xl font-bold hover:bg-green transition-all flex items-center justify-center gap-3 shadow-xl mt-4 active:scale-[0.98]">
                          Confirm Attendance <Send size={18} />
                       </button>
                    </form>
                  </div>
               </div>

               {/* Share Widget */}
               <div className="bg-gold rounded-[2.5rem] p-8 text-center text-deep shadow-xl shadow-amber-900/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">Invite a Fellow Ambassador</p>
                  <div className="flex justify-center gap-4">
                     <button className="w-12 h-12 rounded-full bg-white/20 border border-deep/10 flex items-center justify-center hover:bg-white transition-all"><Share2 size={20}/></button>
                     <button className="w-12 h-12 rounded-full bg-white/20 border border-deep/10 flex items-center justify-center hover:bg-white transition-all"><Bookmark size={20}/></button>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
