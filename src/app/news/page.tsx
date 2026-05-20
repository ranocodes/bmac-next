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
  { 
    id: "public-speaking-march-2026",
    date: "March 15, 2026", 
    title: "Public Speaking Workshop", 
    venue: "BMAC Hall, Nalado Street", 
    time: "09:00 AM",
    desc: "An intensive training session focused on mastering impromptu speaking and commanding the stage with authority.",
    longDesc: "Join us for our monthly intensive workshop where we deep dive into the mechanics of effective communication. This month, we focus on the art of 'The Spontaneous Leader' — learning how to think on your feet and deliver compelling messages under pressure. Whether you are a beginner or looking to refine your expertise, our facilitators will guide you through practical exercises and live feedback sessions."
  },
  { 
    id: "inter-school-debate-april-2026",
    date: "April 2, 2026", 
    title: "Inter-School Debate", 
    venue: "Hillside Hotel, Jos", 
    time: "10:30 AM",
    desc: "A high-stakes debate competition featuring top students from across Plateau State competing for the 2026 Trophy.",
    longDesc: "The BMAC Inter-School Debate Championship returns to Hillside Hotel. This year's competition brings together the brightest minds from across Jos to debate critical issues surrounding technology, governance, and the future of Plateau State. Come and support your school or witness the incredible rhetorical talent of our next generation of leaders."
  },
  { 
    id: "spoken-word-showcase-april-2026",
    date: "April 20, 2026", 
    title: "Spoken Word Showcase", 
    venue: "Museum Auditorium, Jos", 
    time: "04:00 PM",
    desc: "An evening of poetic expression where ambassadors share their voices through powerful performance art.",
    longDesc: "Experience the power of the spoken word at our quarterly showcase. Our ambassadors will take you on a journey of identity, hope, and social commentary. This event is more than a performance; it is a movement that celebrates the rich cultural heritage and vibrant future of Nigerian youth. Admission is free for members and open to the general public with a token registration."
  },
];

export default function News() {
  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card text-center md:text-left">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The BMAC Feed</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
                News & <span className="text-accent italic font-light serif">Updates</span>.
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
                       <div className="relative h-64 md:h-80 lg:h-[500px] rounded-bento overflow-hidden mb-8 shadow-xl">
                          <Image src={feat.img} alt={feat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-card/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                             Featured
                          </div>
                       </div>
                       <div className="max-w-2xl text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                             <span className="text-accent">{feat.category}</span>
                             <div className="w-1 h-1 rounded-full bg-border" />
                             <span>{feat.date}</span>
                          </div>
                          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-secondary tracking-tight mb-4 group-hover:text-primary transition-colors">
                            {feat.title}
                          </h2>
                          <p className="text-muted-foreground text-base leading-relaxed mb-6">
                            {feat.desc}
                          </p>
                          <div className="inline-flex items-center gap-2 font-bold text-sm text-secondary group-hover:gap-4 transition-all">
                            Read Full Story <ArrowRight size={16} className="text-accent" />
                          </div>
                       </div>
                    </Link>
                  </FadeIn>
                ))}

                <hr className="border-border/50" />

                {/* News Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {newsData.filter(n => !n.featured).map((item, i) => (
                     <FadeIn key={i} delay={i * 0.1}>
                        <Link href={`/news/${item.id}`} className="group h-full flex flex-col">
                           <div className="relative aspect-video rounded-card overflow-hidden mb-6">
                              <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                           </div>
                           <div className="flex items-center gap-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              <span className="text-accent">{item.category}</span>
                              <span>{item.date}</span>
                           </div>
                           <h3 className="font-display text-xl font-bold text-secondary mb-3 leading-tight group-hover:text-primary transition-colors">
                              {item.title}
                           </h3>
                           <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mt-auto">
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
                <div className="bg-secondary rounded-bento p-8 md:p-10 text-secondary-foreground relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20" />
                   <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Upcoming <br className="hidden md:block"/> Calendar</h3>
                   
                   {eventsData.length > 0 ? (
                     <div className="space-y-6 relative z-10">
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
                </div>

                <div className="bg-accent rounded-bento p-8 md:p-10 text-center md:text-left shadow-xl shadow-amber-900/5">
                   <h3 className="font-display text-xl md:text-2xl font-bold text-accent-foreground mb-4">Stay Notified.</h3>
                   <p className="text-accent-foreground/70 text-xs md:text-sm leading-relaxed mb-8">Join 500+ readers getting our Friday updates.</p>
                   <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                      <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-card/20 border border-accent-foreground/10 rounded-xl text-sm placeholder:text-accent-foreground/40 focus:outline-none" required />
                      <button className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all">Subscribe</button>
                   </form>
                </div>
             </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
