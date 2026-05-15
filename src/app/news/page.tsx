"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Calendar, MapPin, Newspaper, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";

// Exported for use in dynamic routes
export const newsData = [
  {
    id: "spoken-word-night-2026",
    date: "Jan 28, 2026",
    title: "Annual Spoken Word Night Draws Record Crowd",
    desc: "Over 200 people attended our third annual open mic, celebrating 18 original performances. The event showcased the diversity of talent in Jos.",
    content: `Brilliant Minds Ambassadors Club (BMAC) recently hosted its highly anticipated Annual Spoken Word Night at the Jos Museum Auditorium. The event, which has grown significantly since its inception, saw a record-breaking attendance of over 200 poetry enthusiasts, students, and community leaders.

    Eighteen talented performers took to the stage, delivering powerful verses that touched on themes of identity, social change, and the unique cultural heritage of Plateau State. Suleiman Peace Jagaban, the founder of BMAC, remarked on the importance of providing such platforms: "Our goal is to ensure that every young voice in Jos feels heard and valued. Tonight proved that our youth have incredible stories to tell."

    The night wasn't just about performance; it was a celebration of community. Local artists collaborated with BMAC members to create a truly immersive experience, blending traditional spoken word with modern acoustic sounds. As BMAC looks toward the future, events like these remain central to our mission of building confidence and leadership through the arts.`,
    img: "/images/jj.jpg",
    category: "Culture",
    featured: true,
  },
  {
    id: "digital-literacy-2026",
    date: "Jan 10, 2026",
    title: "Digital Literacy Program Launches",
    desc: "A six-week digital skills curriculum covering research and online safety in partnership with tech hubs.",
    content: `In an era defined by rapid technological advancement, BMAC is proud to announce the launch of its comprehensive Digital Literacy Program. This initiative, developed in partnership with leading tech hubs in Jos, aims to equip young people with the essential digital skills required for the modern workforce.

    The six-week curriculum covers a wide range of topics, including advanced online research techniques, digital productivity tools, and critical training on online safety and data privacy. "Digital literacy is no longer optional; it is a fundamental requirement for leadership in the 21st century," said Amina Bello, BMAC Programs Director.

    Participants will have access to high-speed internet and modern computing facilities, ensuring a hands-on learning experience. Upon completion of the program, members will receive a certificate recognized by our technical partners, opening new doors for internships and career opportunities in the digital space.`,
    img: "/images/digital-literacy.jpg",
    category: "Education",
  },
  {
    id: "cohort-2026-announcement",
    date: "Dec 18, 2025",
    title: "Meet Our 2026 Cohort",
    desc: "72 new members joined BMAC this quarter — representing 14 local schools across Plateau State.",
    content: `We are thrilled to officially welcome 72 new ambassadors to the Brilliant Minds Ambassadors Club as part of our 2026 cohort. This group represents one of our most diverse intakes yet, with members coming from 14 different secondary schools and universities across Plateau State.

    The selection process was rigorous, focusing not just on academic excellence but on a demonstrated passion for community service and a desire to develop leadership potential. These new members will immediately begin their journey with our core workshops in public speaking and critical thinking.

    "Seeing the energy and potential in this new cohort is truly inspiring," noted Chinedu Okonkwo, Head of Communications. "They represent the future of BMAC and, more importantly, the future of leadership in Jos. We can't wait to see what they will achieve over the next year."`,
    img: "/images/IMG_1351.jpg",
    category: "Community",
  },
  {
    id: "partnership-progress-2025",
    date: "Nov 5, 2025",
    title: "Partnering for Progress",
    desc: "How collaboration is driving youth empowerment in the North Central region.",
    content: `BMAC's impact is amplified through the strength of our partnerships. Our latest initiative, "Partnering for Progress," highlights the vital role that local businesses, NGOs, and government agencies play in supporting youth development.

    By working together, we are able to provide our members with unique opportunities, from industry-specific mentorship to specialized vocational training. These collaborations ensure that our programs remain relevant and impactful, directly addressing the needs of the youth in Plateau State.

    We extend our sincere gratitude to all our community partners who share our vision of a confident and empowered next generation. Together, we are not just running a club; we are building a sustainable ecosystem for leadership and growth.`,
    img: "/images/cp1.jpg",
    category: "Partnership",
  },
];

export const eventsData = [
  { date: "March 15, 2026", title: "Public Speaking Workshop", venue: "BMAC Hall, Jos", time: "09:00 AM" },
  { date: "April 2, 2026", title: "Inter-School Debate", venue: "Hillside Hotel, Jos", time: "10:30 AM" },
  { date: "April 20, 2026", title: "Spoken Word Showcase", venue: "Museum Auditorium", time: "04:00 PM" },
];

export default function News() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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

            {/* UNIFORM CMS GRID */}
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
          </div>

          <aside className="lg:col-span-4 space-y-12">
             <div className="sticky top-32 space-y-8 md:space-y-12">
                <div className="bg-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                   <h3 className="font-display text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Upcoming <br className="hidden md:block"/> Calendar</h3>
                   <div className="space-y-6 relative z-10">
                      {eventsData.map((event, i) => (
                        <div key={i} className="group flex gap-4 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                           <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center group-hover:bg-gold transition-colors">
                              <span className="text-[10px] font-bold uppercase group-hover:text-deep">{event.date.split(' ')[0].substring(0,3)}</span>
                              <span className="text-sm font-extrabold group-hover:text-deep">{event.date.split(' ')[1].replace(',','')}</span>
                           </div>
                           <div>
                              <h4 className="text-sm font-bold group-hover:text-gold transition-colors">{event.title}</h4>
                              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{event.venue}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-gold rounded-[2.5rem] p-8 text-center md:text-left">
                   <h3 className="font-display text-2xl font-bold text-deep mb-4">Newsletter</h3>
                   <p className="text-deep/70 text-sm leading-relaxed mb-6">Join 500+ readers getting our Friday updates.</p>
                   <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                      <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-white/20 border border-deep/10 rounded-xl text-sm placeholder:text-deep/40 focus:outline-none" required />
                      <button className="w-full py-4 bg-deep text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">Subscribe</button>
                   </form>
                </div>
             </div>
          </aside>
        </div>
      </section>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="bg-white p-8 md:p-12">
            <span className="text-gold font-bold tracking-widest uppercase text-[10px] mb-4 block">Registration</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-deep tracking-tight mb-8 leading-none">{selectedEvent.title}</h2>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Calendar size={20} /></div>
                     <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</p><p className="font-bold text-slate-800 text-sm">{selectedEvent.date} @ {selectedEvent.time}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><MapPin size={20} /></div>
                     <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue</p><p className="font-bold text-slate-800 text-sm">{selectedEvent.venue}</p></div>
                  </div>
               </div>
               <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Registered!"); setSelectedEvent(null); }}>
                  <input type="text" placeholder="Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none" required />
                  <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none" required />
                  <button className="w-full py-4 bg-deep text-white font-bold rounded-xl text-sm hover:bg-gold transition-all">Confirm Seat <ArrowRight size={16} className="inline ml-1" /></button>
               </form>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
