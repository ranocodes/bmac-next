"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { EmptyState } from "@/components/ui/EmptyState";
import { DigitalPass } from "@/components/ui/DigitalPass";
import NewsletterModal from "@/components/ui/NewsletterModal";
import { cn } from "@/lib/utils";
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

interface NewsClientProps {
  initialNews: any[];
  initialEvents: any[];
}

function normalizeNews(raw: any[]): NewsArticle[] {
  return raw.map(a => ({
    ...a,
    img: (a as any).img_url || a.img || "/images/placeholder.jpg",
    desc: a.desc || (a as any).description || "",
  }));
}

function normalizeEvents(raw: any[]): EventPass[] {
  return raw.map(e => ({
    ...e,
    date: (e as any).event_date || e.date || "",
    desc: e.desc || (e as any).description || "",
    features: (e as any).features || [],
  }));
}

export default function NewsClient({ initialNews, initialEvents }: NewsClientProps) {
  const [news] = useState<NewsArticle[]>(normalizeNews(initialNews));
  const [events] = useState<EventPass[]>(normalizeEvents(initialEvents));
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Dynamic Header */}
      <section className="bg-background pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">The BMAC Chronicle</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary mt-2">
            News & Momentum
          </h1>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Side: News Feed */}
          <div className="lg:col-span-8 space-y-16">
            {news.length > 0 ? (
              <>
                {/* Featured Article */}
                {news.filter(n => n.featured).map(feat => (
                  <FadeIn key={feat.id}>
                    <Link href={`/news/${feat.id}`} className="group block">
                       <div className="relative h-64 md:h-96 rounded-xl border border-border overflow-hidden mb-6">
                          <Image src={feat.img} alt={feat.title} fill className="object-cover" />
                          <div className="absolute top-4 left-4 bg-card px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-primary">
                             Featured Story
                          </div>
                       </div>
                       <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                             <span className="text-primary">{feat.category}</span>
                             <div className="w-1 h-1 rounded-full bg-border" />
                             <span>{feat.date}</span>
                          </div>
                          <h2 className="font-display text-2xl md:text-4xl font-bold text-secondary tracking-tight group-hover:text-primary transition-colors">
                            {feat.title}
                          </h2>
                          <p className="text-muted-foreground text-base leading-relaxed mt-4">
                            {feat.desc}
                          </p>
                          <div className="inline-flex items-center gap-2 font-bold text-sm text-primary mt-6 group-hover:gap-4 transition-all">
                            Read Full Story <ArrowRight size={16} />
                          </div>
                       </div>
                    </Link>
                  </FadeIn>
                ))}

                <hr className="border-border" />

                {/* News Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                   {news.filter(n => !n.featured).map((item, i) => (
                     <FadeIn key={item.id} delay={i * 0.05}>
                        <Link href={`/news/${item.id}`} className="group h-full flex flex-col">
                           <div className="relative aspect-video rounded-xl border border-border overflow-hidden mb-5">
                              <Image src={item.img} alt={item.title} fill className="object-cover" />
                           </div>
                           <div className="flex items-center gap-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                              <span className="text-primary">{item.category}</span>
                              <span>{item.date}</span>
                           </div>
                           <h3 className="font-display text-xl font-bold text-secondary leading-tight group-hover:text-primary transition-colors">
                              {item.title}
                           </h3>
                           <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mt-2">
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
          <aside className="lg:col-span-4">
             <div className="lg:sticky lg:top-28 space-y-6">
                {/* Upcoming Events Mini-Widget */}
                <div className="bg-card border border-border rounded-xl p-6">
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="font-display font-bold text-xl text-secondary">Events</h4>
                      <Link href="/events" className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                         View All
                      </Link>
                   </div>

                   <div className="space-y-5">
                       {events.slice(0, 2).map((event, i) => (
                         <Link href={`/events/${event.id}`} key={event.id} className="block group">
                           <div className="flex gap-4 items-center">
                              <div className={cn(
                                "min-w-[42px] h-[42px] flex flex-col items-center justify-center rounded-lg transition-colors",
                                i === 0 ? "bg-secondary text-white" : "bg-muted text-secondary"
                              )}>
                                  <span className="text-[8px] font-bold uppercase opacity-60">{formatEventDate(event.date).month}</span>
                                  <span className="text-sm font-extrabold leading-none">{formatEventDate(event.date).day}</span>
                              </div>
                              <div className="flex-1">
                                 {i === 0 && (
                                   <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
                                      Happening Soon
                                   </div>
                                 )}
                                 <h5 className="font-bold text-xs text-secondary group-hover:text-primary transition-colors leading-tight line-clamp-1">{event.title}</h5>
                                 <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter">{event.venue}</p>
                              </div>
                           </div>
                         </Link>
                       ))}
                   </div>
                </div>

                {/* Sticky Newsletter */}
                <div className="bg-card border border-border rounded-xl p-6">
                   <h3 className="font-display text-xl font-bold text-secondary">Stay Notified</h3>
                   <p className="text-muted-foreground text-xs leading-relaxed mt-2 mb-5">Get our official Friday updates with the latest stories, workshop alerts, and leadership tips.</p>
                   <button onClick={() => setIsModalOpen(true)} className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                      Subscribe Now
                   </button>
                </div>
             </div>
          </aside>
        </div>
      </section>

      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Chronicle" />
    </>
  );
}
