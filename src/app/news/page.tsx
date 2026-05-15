"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Calendar, MapPin, Newspaper, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";

const news = [
  {
    date: "Jan 28, 2026",
    title: "Annual Spoken Word Night Draws Record Crowd",
    desc: "Over 200 people attended our third annual open mic, celebrating 18 original performances. The event showcased the diversity of talent in Jos, from traditional poetry to modern urban beats.",
    img: "/images/jj.jpg",
    category: "Culture",
    featured: true,
  },
  {
    date: "Jan 10, 2026",
    title: "Digital Literacy Program Launches",
    desc: "A six-week digital skills curriculum covering research and online safety in partnership with tech hubs.",
    img: "/images/digital-literacy.jpg",
    category: "Education",
  },
  {
    date: "Dec 18, 2025",
    title: "Meet Our 2026 Cohort",
    desc: "72 new members joined BMAC this quarter — representing 14 local schools across Plateau State.",
    img: "/images/IMG_1351.jpg",
    category: "Community",
  },
  {
    date: "Nov 5, 2025",
    title: "Partnering for Progress",
    desc: "How collaboration is driving youth empowerment in the North Central region.",
    img: "/images/cp1.jpg",
    category: "Partnership",
  },
  {
    date: "Oct 22, 2025",
    title: "The Power of Voice",
    desc: "A member's journey from public speaking anxiety to hosting regional events.",
    img: "/images/maryam1.jpg",
    category: "Story",
  },
];

const events = [
  {
    date: "March 15, 2026",
    title: "Public Speaking Workshop",
    venue: "BMAC Hall, Nalado Street",
    time: "09:00 AM",
  },
  {
    date: "April 2, 2026",
    title: "Inter-School Debate",
    venue: "Hillside Hotel, Jos",
    time: "10:30 AM",
  },
  {
    date: "April 20, 2026",
    title: "Spoken Word Showcase",
    venue: "Jos Museum Auditorium",
    time: "04:00 PM",
  },
];

export default function News() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      {/* Dynamic Header */}
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-white">
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

      {/* CMS-Ready Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Feed - Scalable for more items */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Featured Article */}
            {news.filter(n => n.featured).map((feat, i) => (
              <FadeIn key={i}>
                <div className="group cursor-pointer">
                   <div className="relative h-[500px] rounded-[3rem] overflow-hidden mb-8 shadow-2xl shadow-emerald-900/5">
                      <Image src={feat.img} alt={feat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-green">
                         Featured Article
                      </div>
                   </div>
                   <div className="max-w-2xl">
                      <div className="flex items-center gap-4 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                         <span>{feat.category}</span>
                         <div className="w-1 h-1 rounded-full bg-slate-200" />
                         <span>{feat.date}</span>
                      </div>
                      <h2 className="font-display text-4xl font-extrabold text-deep tracking-tight mb-4 group-hover:text-green transition-colors">
                        {feat.title}
                      </h2>
                      <p className="text-slate-500 text-lg leading-relaxed mb-6">
                        {feat.desc}
                      </p>
                      <Link href="#" className="inline-flex items-center gap-2 font-bold text-sm text-deep group-hover:gap-4 transition-all">
                        Read Investigation <ArrowRight size={16} className="text-gold" />
                      </Link>
                   </div>
                </div>
              </FadeIn>
            ))}

            <hr className="border-slate-100" />

            {/* Sub-grid of Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {news.filter(n => !n.featured).map((item, i) => (
                 <FadeIn key={i} delay={i * 0.1}>
                    <div className="group cursor-pointer">
                       <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
                          <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                       </div>
                       <div className="flex items-center gap-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span className="text-gold">{item.category}</span>
                          <span>{item.date}</span>
                       </div>
                       <h3 className="font-display text-xl font-bold text-deep mb-3 leading-tight group-hover:text-green transition-colors">
                          {item.title}
                       </h3>
                       <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                          {item.desc}
                       </p>
                    </div>
                 </FadeIn>
               ))}
            </div>
          </div>

          {/* Sidebar - Sticky functionality */}
          <aside className="lg:col-span-4 space-y-12">
             <div className="sticky top-32 space-y-12">
                
                {/* Events Widget */}
                <div className="bg-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green rounded-full blur-[60px] opacity-20" />
                   <h3 className="font-display text-2xl font-bold mb-8 relative z-10">Upcoming <br/> Calendars</h3>
                   
                   <div className="space-y-6 relative z-10">
                      {events.map((event, i) => (
                        <div key={i} className="group flex gap-4 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                           <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center group-hover:bg-gold transition-colors">
                              <span className="text-[10px] font-bold uppercase group-hover:text-deep">{event.date.split(' ')[0]}</span>
                              <span className="text-sm font-extrabold group-hover:text-deep">{event.date.split(' ')[1].replace(',','')}</span>
                           </div>
                           <div>
                              <h4 className="text-sm font-bold group-hover:text-gold transition-colors">{event.title}</h4>
                              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{event.venue.split(',')[0]}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white hover:text-deep transition-all">
                      View Full Schedule
                   </button>
                </div>

                {/* Newsletter Box */}
                <div className="bg-gold rounded-[2.5rem] p-8">
                   <h3 className="font-display text-2xl font-bold text-deep mb-4">Stay Notified.</h3>
                   <p className="text-deep/70 text-sm leading-relaxed mb-6">
                      Get exclusive member stories and leadership opportunities delivered to your inbox.
                   </p>
                   <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                      <input type="email" placeholder="Your Email" className="w-full px-4 py-3 bg-white/20 border border-deep/10 rounded-xl text-sm placeholder:text-deep/40 focus:outline-none" required />
                      <button className="w-full py-4 bg-deep text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">Join 500+ Readers</button>
                   </form>
                </div>
             </div>
          </aside>
        </div>
      </section>

      {/* Modal - Unified Design */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="bg-white p-8 md:p-12">
            <span className="text-gold font-bold tracking-[0.2em] uppercase text-[10px] mb-4 block">Event Registration</span>
            <h2 className="font-display text-4xl font-extrabold text-deep tracking-tighter mb-8 leading-none">
              {selectedEvent.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Calendar size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</p>
                        <p className="font-bold text-slate-800 text-sm">{selectedEvent.date} — {selectedEvent.time}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <MapPin size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue</p>
                        <p className="font-bold text-slate-800 text-sm">{selectedEvent.venue}</p>
                     </div>
                  </div>
               </div>
               
               <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Registered!"); setSelectedEvent(null); }}>
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" required />
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" required />
                  <button className="w-full py-4 bg-deep text-white font-bold rounded-xl text-sm hover:bg-green transition-all flex items-center justify-center gap-2">
                    Confirm Attendance <ArrowRight size={16} />
                  </button>
               </form>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
