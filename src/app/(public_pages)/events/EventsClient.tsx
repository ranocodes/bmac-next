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
      <section className="bg-background pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Official Calendar
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary mt-2">
            Upcoming Engagements
          </h1>
          <p className="text-muted-foreground max-w-lg text-base md:text-lg mt-4 leading-relaxed font-medium">
            Secure your digital entry pass to the next gathering of Jos's brightest minds.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {events.map((event, i) => {
            const fd = formatEventDate(event.date);
            return (
            <FadeIn key={event.id} delay={i * 0.05}>
              <Link href={`/events/${event.id}`} className="group block">
                <div className="bg-card rounded-xl border border-border p-5 md:p-6 transition-colors hover:border-primary/40 group-hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {fd.day && (
                        <div className="w-12 shrink-0 text-center border-r border-border/60 pr-4">
                          <p className="font-display text-2xl font-bold leading-none text-secondary">{fd.day}</p>
                          {fd.month && <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{fd.month}</p>}
                        </div>
                      )}
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{event.category}</p>
                        <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-secondary mt-1">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold whitespace-nowrap">
                      {event.isPaid ? `₦${(event.price || 0).toLocaleString()}` : "Free Entry"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3 line-clamp-2">
                    {event.desc}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-4 border-t border-border/50 text-xs">
                    <span className="inline-flex items-center gap-2 text-muted-foreground font-medium">
                      <Clock size={14} /> {event.time || "TBA"}
                    </span>
                    <span className="inline-flex items-center gap-2 text-muted-foreground font-medium truncate">
                      <MapPin size={14} /> {event.venue || "Venue TBA"}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-primary font-bold group-hover:gap-2.5 transition-all">
                      View Event <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          );
          })}
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Stay Synchronized</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-secondary mt-2">
            Import the official BMAC leadership cycle directly into your workspace.
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button onClick={handleAddToGoogle} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card text-secondary font-bold px-6 h-11 hover:bg-muted transition-colors">
              <Calendar size={16} /> Add to Google
            </button>
            <button onClick={handleAddToApple} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card text-secondary font-bold px-6 h-11 hover:bg-muted transition-colors">
              <Calendar size={16} /> Add to Apple
            </button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold px-6 h-11 hover:bg-primary/90 transition-colors">
              <Send size={16} /> Get Email Alerts
            </button>
          </div>
        </div>
      </section>
      
      <NewsletterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Join the Elite List" />
    </>
  );
}
