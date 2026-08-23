"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import NewsletterModal from "@/components/ui/NewsletterModal";
import type { EventPass } from "@/types/cms";

type EventStatus = { label: string; tone: "open" | "closed" | "sold" };

function getEventStatus(e: EventPass): EventStatus {
  const cap = e.capacity && e.capacity > 0 ? e.capacity : 0;
  const used = e.capacityUsed || 0;
  if (cap > 0 && used >= cap) return { label: "Sold Out", tone: "sold" };
  const dl = e.registrationDeadline;
  if (dl) {
    const dlDate = /^\d{4}-\d{2}-\d{2}$/.test(dl) ? new Date(dl + "T23:59:59") : new Date(dl);
    if (!isNaN(dlDate.getTime()) && dlDate.getTime() < Date.now()) return { label: "Registration Closed", tone: "closed" };
  }
  return { label: "Registration Open", tone: "open" };
}

const statusClasses: Record<EventStatus["tone"], string> = {
  open: "bg-primary text-card",
  closed: "bg-secondary/80 text-card backdrop-blur-sm",
  sold: "bg-destructive text-white",
};

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
    img: (e as any).img || (e as any).image || "",
    capacity: Number((e as any).capacity || 0),
    capacityUsed: Number((e as any).capacity_used ?? (e as any).capacityUsed ?? 0),
    registrationDeadline: (e as any).registration_deadline || (e as any).registrationDeadline || "",
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => {
            const fd = formatEventDate(event.date);
            const status = getEventStatus(event);
            return (
            <FadeIn key={event.id} delay={i * 0.05} className="h-full">
              <Link href={`/events/${event.slug || event.id}`} className="group block h-full rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/40">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {event.img ? (
                    <Image
                      src={event.img}
                      alt={event.title}
                      fill
                      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary via-primary to-accent/50 flex items-center justify-center">
                      <div className="text-center px-6">
                        <Calendar size={36} className="mx-auto text-card/40" />
                        <p className="mt-3 text-card/60 text-[11px] font-bold uppercase tracking-widest">{event.category}</p>
                      </div>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${statusClasses[status.tone]}`}>
                    {status.label}
                  </span>
                  {fd.day && (
                    <div className="absolute bottom-3 left-3 flex items-baseline gap-1.5 rounded-lg bg-card/90 backdrop-blur px-3 py-1.5">
                      <span className="font-display text-xl font-bold leading-none text-secondary">{fd.day}</span>
                      {fd.month && <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{fd.month}</span>}
                    </div>
                  )}
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{event.category}</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-bold whitespace-nowrap">
                      {event.isPaid ? `₦${(event.price || 0).toLocaleString()}` : "Free Entry"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-bold tracking-tight text-secondary mt-2 group-hover:text-primary transition-colors break-words">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-2">
                    {event.desc}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-border/50 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Clock size={13} /> {event.time || "TBA"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium truncate max-w-full">
                      <MapPin size={13} /> {event.venue || "Venue TBA"}
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
