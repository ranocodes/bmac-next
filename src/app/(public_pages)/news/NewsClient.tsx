"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { EmptyState } from "@/components/ui/EmptyState";
import { DigitalPass } from "@/components/ui/DigitalPass";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { cn } from "@/lib/utils";
import { getAll, seedIfEmpty } from "@/data/store";
import { mockNews, mockEvents } from "@/data/mock-data";
import type { NewsArticle, EventPass } from "@/types/cms";

function formatEventDate(raw: string | undefined): { month: string; day: string } {
  if (!raw) return { month: "", day: "" };
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    if (isNaN(d.getTime())) return { month: "", day: "" };
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: String(d.getDate()),
    };
  }
  const parts = raw.split(" ");
  return {
    month: parts[0]?.substring(0, 3) || "",
    day: (parts[1] || "").replace(",", ""),
  };
}

export default function NewsClient() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<EventPass[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    seedIfEmpty("news", mockNews.map(n => ({ ...n, desc: n.description, img: n.img_url })));
    seedIfEmpty("events", mockEvents.map(e => ({ ...e, date: e.event_date, desc: e.description, isPaid: e.is_paid })));
    setNews(getAll<NewsArticle>("news").map(a => ({ ...a, img: (a as any).img_url || a.img || "/images/placeholder.jpg", desc: a.desc || (a as any).description || "" })));
    setEvents(getAll<EventPass>("events").map(e => ({ ...e, date: (e as any).event_date || e.date || "", desc: e.desc || (e as any).description || "" })));
  }, []);

  return (
    <>
      {/* Dynamic Header */}
      <section className="relative min-h-[45dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-primary/5 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The BMAC Chronicle</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
                News & <span className="text-accent italic font-light serif">Momentum</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Side: News Feed */}
          <div className="lg:col-span-8 space-y-16 md:space-y-24">
            {news.length > 0 ? (
              <>
                {/* Featured Article */}
                {news.filter(n => n.featured).map((feat, i) => (
                  <FadeIn key={feat.id}>
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
                   {news.filter(n => !n.featured).map((item, i) => (
                     <FadeIn key={item.id} delay={i * 0.1}>
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
                       {events.slice(0, 2).map((event, i) => (
                         <Link href={`/news/events/${event.id}`} key={event.id} className="block group">
                           <div className="flex gap-4 items-center relative z-10 transition-transform group-hover:translate-x-2">
                              <div className={cn(
                                "min-w-[42px] h-[42px] flex flex-col items-center justify-center rounded-xl transition-colors",
                                i === 0 ? "bg-secondary text-white" : "bg-muted text-secondary"
                              )}>
                                  <span className="text-[8px] font-bold uppercase opacity-60">{formatEventDate(event.date).month}</span>
                                  <span className="text-sm font-extrabold leading-none">{formatEventDate(event.date).day}</span>
                              </div>
                              <div className="flex-1">
                                 {i === 0 && (
                                   <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-primary mb-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
                                      Happening Soon
                                   </div>
                                 )}
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
    </>
  );
}
