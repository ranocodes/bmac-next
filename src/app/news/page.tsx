"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Calendar, MapPin, Newspaper, Bookmark, Share2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { EmptyState } from "@/components/ui/EmptyState";
import { DigitalPass } from "@/components/ui/DigitalPass";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { cn } from "@/lib/utils";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Dynamic Header */}
      <section className="relative min-h-[45dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-primary/5 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The BMAC Chronicle</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
                News & <span className="text-accent italic font-light serif">Momentum</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Side: News Feed */}
          <div className="lg:col-span-8 space-y-16 md:space-y-24">
            {newsData.length > 0 ? (
              <>
                {/* Featured Article */}
                {newsData.filter(n => n.featured).map((feat, i) => (
                  <FadeIn key={i}>
                    <Link href={`/news/${feat.id}`} className="group block">
                       <div className="relative h-64 md:h-80 lg:h-[500px] rounded-[2rem] md:rounded-bento overflow-hidden mb-8 shadow-xl">
                          <Image src={feat.img} alt={feat.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-card/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                             Featured Story
                          </div>
                       </div>
                       <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                             <span className="text-accent">{feat.category}</span>
                             <div className="w-1 h-1 rounded-full bg-border" />
                             <span>{feat.date}</span>
                          </div>
                          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-secondary tracking-tight mb-6 group-hover:text-primary transition-colors leading-[1.1]">
                            {feat.title}
                          </h2>
                          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                            {feat.desc}
                          </p>
                          <div className="inline-flex items-center gap-2 font-bold text-sm text-secondary group-hover:gap-4 transition-all">
                            Read Full Story <ArrowRight size={18} className="text-accent" />
                          </div>
                       </div>
                    </Link>
                  </FadeIn>
                ))}

                <hr className="border-border/50" />

                {/* News Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                   {newsData.filter(n => !n.featured).map((item, i) => (
                     <FadeIn key={i} delay={i * 0.1}>
                        <Link href={`/news/${item.id}`} className="group h-full flex flex-col">
                           <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                              <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                           </div>
                           <div className="flex items-center gap-3 mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              <span className="text-accent">{item.category}</span>
                              <span>{item.date}</span>
                           </div>
                           <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-4 leading-tight group-hover:text-primary transition-colors">
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

          {/* Right Side: Simple Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
             <div className="sticky top-28 space-y-8">
                {/* Upcoming Events Mini-Widget */}
                <div className="bg-card/60 backdrop-blur-xl border border-border/50 p-8 rounded-bento shadow-2xl overflow-hidden relative">
                   <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                   
                   <div className="flex items-center justify-between mb-8 relative z-10">
                      <h4 className="font-display font-extrabold text-xl text-secondary">Events</h4>
                      <Link href="/events" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                         View All
                      </Link>
                   </div>

                   <div className="relative space-y-6">
                       {eventsData.slice(0, 2).map((event, i) => (
                         <Link href={`/news/events/${event.id}`} key={i} className="block group">
                           <div className="flex gap-4 items-center relative z-10 transition-transform group-hover:translate-x-2">
                              <div className={cn(
                                "min-w-[42px] h-[42px] flex flex-col items-center justify-center rounded-xl transition-colors",
                                i === 0 ? "bg-secondary text-white" : "bg-muted text-secondary"
                              )}>
                                 <span className="text-[8px] font-bold uppercase opacity-60">{event.date.split(' ')[0].substring(0,3)}</span>
                                 <span className="text-sm font-extrabold leading-none">{event.date.split(' ')[1].replace(',','')}</span>
                              </div>
                              <div className="flex-1">
                                 <h5 className="font-bold text-[12px] text-secondary group-hover:text-primary transition-colors leading-tight line-clamp-1">{event.title}</h5>
                                 <p className="text-[9px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter">{event.venue}</p>
                              </div>
                           </div>
                         </Link>
                       ))}
                   </div>
                </div>

                {/* Sticky Newsletter */}
                <div className="bg-card border border-border/50 rounded-bento p-8 relative overflow-hidden group shadow-lg">
                   <div className="relative z-10">
                      <h3 className="font-display text-xl font-extrabold text-secondary mb-3">Stay Notified.</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-6">Join 500+ readers getting our official Friday updates.</p>
                      <button onClick={() => setIsModalOpen(true)} className="w-full py-4 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-primary transition-all shadow-lg active:scale-[0.98]">
                         Subscribe Now
                      </button>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </section>

      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Chronicle" />
    </main>
  );
}
