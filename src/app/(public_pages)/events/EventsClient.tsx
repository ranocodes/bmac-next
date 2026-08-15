"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import NewsletterModal from "@/components/ui/NewsletterModal";
import type { EventPass } from "@/types/cms";

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

function toCalendarDate(raw: string | undefined): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.replace(/-/g, "");
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function toCalendarTime(raw: string | undefined): string {
  const m = String(raw || "").trim().match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!m) return "0900";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}${min}`;
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function nextEventDateTime(event: EventPass): { date: string; time: string } | null {
  const cd = toCalendarDate(event.date);
  if (!cd) return null;
  const ct = toCalendarTime(event.time);
  return { date: cd, time: ct };
}

interface EventsClientProps {
  initialEvents: any[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [events] = useState<EventPass[]>(initialEvents.map(e => ({
    ...e,
    date: (e as any).event_date || e.date || "",
    desc: e.desc || (e as any).description || "",
    features: (e as any).features || [],
    isPaid: (e as any).is_paid ?? (e as any).isPaid ?? false,
    price: Number((e as any).price || 0),
  })));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToGoogle = () => {
    const event = events.find(e => e.date && e.title);
    const dt = event ? nextEventDateTime(event) : null;
    if (!event || !dt) {
      setIsModalOpen(true);
      return;
    }
    const endDate = dt.date;
    const endTime = (() => {
      const h = Math.min(parseInt(dt.time.slice(0, 2), 10) + 1, 23);
      return `${String(h).padStart(2, "0")}${dt.time.slice(2)}`;
    })();
    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(event.title)}` +
      `&dates=${dt.date}T${dt.time}00/${endDate}T${endTime}00` +
      `&details=${encodeURIComponent(event.desc || "")}` +
      `&location=${encodeURIComponent(event.venue || "")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddToApple = () => {
    const parts = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BMAC//Events//EN",
      "CALSCALE:GREGORIAN",
    ];
    events.forEach((event, i) => {
      const dt = event.date && event.title ? nextEventDateTime(event) : null;
      if (!dt) return;
      const endDate = dt.date;
      const endTime = (() => {
        const h = Math.min(parseInt(dt.time.slice(0, 2), 10) + 1, 23);
        return `${String(h).padStart(2, "0")}${dt.time.slice(2)}`;
      })();
      parts.push(
        "BEGIN:VEVENT",
        `UID:bmac-${event.id || i}@bmac.org.ng`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART:${dt.date}T${dt.time}00`,
        `DTEND:${endDate}T${endTime}00`,
        `SUMMARY:${icsEscape(event.title)}`,
        `DESCRIPTION:${icsEscape(event.desc || "")}`,
        `LOCATION:${icsEscape(event.venue || "")}`,
        "END:VEVENT"
      );
    });
    if (parts.length <= 4) {
      setIsModalOpen(true);
      return;
    }
    parts.push("END:VCALENDAR");
    const blob = new Blob([parts.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bmac-events.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="relative min-h-[50dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-primary/5 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Official Calendar
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
              Upcoming <span className="text-accent italic font-light serif">Engagements</span>.
            </h1>
            <p className="text-muted-foreground max-w-lg text-base md:text-lg mt-6 leading-relaxed font-medium">
               Secure your digital entry pass to the next gathering of Jos's brightest minds.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6 relative overflow-x-clip">
        <div className="max-w-7xl mx-auto space-y-16">
          {events.map((event, i) => {
            const fd = formatEventDate(event.date);
            return (
            <FadeIn key={event.id} delay={i * 0.1}>
              <Link href={`/events/${event.id}`} className="group relative block">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    <div className="lg:col-span-2 relative">
                       <div className="flex flex-row lg:flex-col items-baseline lg:items-start gap-2">
                          <span className="text-6xl md:text-8xl font-display font-extrabold text-secondary/5 tracking-tighter absolute -top-8 -left-3 lg:-top-12 lg:-left-6 pointer-events-none group-hover:text-primary/10 transition-colors duration-700">
                             0{i + 1}
                          </span>
                          {fd.day && (
                          <span className="text-4xl md:text-6xl font-display font-extrabold text-secondary tracking-tighter leading-none relative z-10">
                             {fd.day}
                          </span>
                          )}
                          {fd.month && (
                          <span className="text-lg md:text-xl font-bold text-accent uppercase tracking-[0.2em] relative z-10">
                             {fd.month}
                          </span>
                          )}
                       </div>
                    </div>

                    <div className="lg:col-span-10">
                       <div className="relative group-hover:-translate-y-1 transition-transform duration-700">
                          <div className="bg-card border border-border/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-diffused relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity" />
                             
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border/30 pb-6">
                                <div>
                                   <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-2 block">
                                      {event.category}
                                   </span>
                                   <h3 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-secondary leading-none">
                                      {event.title}
                                   </h3>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/50 shadow-inner">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                   <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">
                                      {event.isPaid ? `₦${(event.price || 0).toLocaleString()}` : "Free Entry"}
                                   </span>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium line-clamp-3">
                                   {event.desc}
                                </p>
                                <div className="flex flex-wrap md:justify-end gap-4 md:gap-6">
                                   <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-primary">
                                         <Clock size={16} />
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Time</p>
                                         <p className="text-xs font-bold text-secondary">{event.time}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-primary">
                                         <MapPin size={16} />
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Venue</p>
                                          <p className="text-xs font-bold text-secondary truncate sm:max-w-[160px]">{event.venue}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="mt-8 flex justify-end">
                                <div className="w-12 h-12 rounded-full bg-secondary text-card flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500 shadow-xl">
                                   <ArrowRight size={20} />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </Link>
            </FadeIn>
          );
          })}
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-6 bg-card border-t border-border/50">
        <div className="max-w-4xl mx-auto">
           <div className="bg-secondary rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
                 <h2 className="font-display text-3xl md:text-5xl font-extrabold text-card tracking-tighter mb-6">
                    Stay <span className="text-accent italic font-light serif">Synchronized</span>.
                 </h2>
                 <p className="text-card/60 text-base md:text-lg mb-8 max-w-xl mx-auto font-medium leading-relaxed">
                    Import the official BMAC leadership cycle directly into your workspace.
                 </p>
                 <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={handleAddToGoogle} className="px-6 md:px-8 py-3 md:py-4 rounded-full bg-card/5 border border-card/10 text-card font-bold hover:bg-card/10 transition-all flex items-center gap-2 backdrop-blur-md shadow-xl group text-sm md:text-base">
                       <Calendar size={16} className="text-accent group-hover:scale-110 transition-transform" />
                       Add to Google
                    </button>
                    <button onClick={handleAddToApple} className="px-6 md:px-8 py-3 md:py-4 rounded-full bg-card/5 border border-card/10 text-card font-bold hover:bg-card/10 transition-all flex items-center gap-2 backdrop-blur-md shadow-xl group text-sm md:text-base">
                       <Calendar size={16} className="text-accent group-hover:scale-110 transition-transform" />
                       Add to Apple
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="px-6 md:px-8 py-3 md:py-4 rounded-full bg-accent text-accent-foreground font-bold hover:bg-card hover:text-accent transition-all flex items-center gap-2 shadow-xl group text-sm md:text-base">
                       <Send size={16} className="group-hover:scale-110 transition-transform" />
                       Get Email Alerts
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </section>
      
      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Elite List" />
    </>
  );
}
