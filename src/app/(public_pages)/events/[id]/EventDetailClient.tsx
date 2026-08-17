"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Send, Clock, CheckCircle2, X, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import ReactMarkdown from "react-markdown";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShareButtons from "@/components/ui/ShareButtons";
import { registerForEvent } from "@/actions/events";
import { createTicketOrder, verifyTicketPayment } from "@/actions/tickets";
import { loadPaystack } from "@/lib/paystack";
import { buildIcs, downloadIcs } from "@/lib/ics";
import type { EventPass } from "@/types/cms";

function formatDisplayDate(raw: string | undefined): string {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return raw;
}

interface EventDetailClientProps {
  id: string;
  initialEvents: any[];
  initialTestimonials?: any[];
}

export default function EventDetailClient({ id, initialEvents, initialTestimonials = [] }: EventDetailClientProps) {
  const all = initialEvents.map(e => ({
    ...e,
    date: (e as any).event_date || e.date || "",
    desc: e.desc || (e as any).description || "",
    features: (e as any).features || [],
    isPaid: (e as any).is_paid ?? (e as any).isPaid ?? false,
    price: Number((e as any).price || 0),
    img: (e as any).img || "",
    agenda: (e as any).agenda || [],
    audienceFor: (e as any).audienceFor || (e as any).audience_for || [],
    audienceNotFor: (e as any).audienceNotFor || (e as any).audience_not_for || [],
    faqs: (e as any).faqs || [],
    policies: (e as any).policies || "",
  }));
  const found = all.find(e => e.id === id) || null;
  const [event] = useState<EventPass | null>(found);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isReserved, setIsReserved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState({ privacy: false, marketing: false });
  const [passInfo, setPassInfo] = useState<{ passUrl: string; reference: string } | null>(null);
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("register");
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShowStickyCta(false);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const relatedEvents = (() => {
    if (!event) return [];
    const parseDate = (d: string) => (d ? new Date(d.replace("T00:00:00", "") + "T00:00:00").getTime() || 0 : 0);
    return all
      .filter(e => e.id !== event.id)
      .map(e => ({ ...e, _cat: e.category === event.category ? 1 : 0, _d: Math.abs(parseDate(e.date) - (parseDate(event.date) || parseDate(e.date))) }))
      .sort((a, b) => b._cat - a._cat || a._d - b._d)
      .slice(0, 3);
  })();

  const agenda = (event as any).agenda || [];
  const audienceFor = (event as any).audienceFor || [];
  const audienceNotFor = (event as any).audienceNotFor || [];
  const faqs = (event as any).faqs || [];
  const policies = (event as any).policies || "";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const publishedTestimonials = initialTestimonials.filter((t: any) => t.status === "published");

  const handleAddToCalendar = () => {
    if (!event) return;
    const ics = buildIcs({
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.desc,
    });
    downloadIcs(ics, `${event.id}.ics`);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Please enter your full name.";
    if (!formData.email.trim()) {
      errors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (formData.phone.trim() && !/^[+\d][\d\s\-()]{6,}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number (e.g. +234 803 456 7891).";
    }
    if (!consent.privacy) errors.consent = "Please accept the privacy policy to continue.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaystackPayment = async () => {
    if (!event) return;
    try {
      const order = await createTicketOrder({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        quantity: 1,
        consent: consent.privacy,
      });
      if (order.error) {
        setFormError(order.error);
        setIsPending(false);
        return;
      }
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        setFormError("Payments are not configured yet. Please try again later.");
        setIsPending(false);
        return;
      }
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: paystackKey,
        email: formData.email,
        amount: order.amountKobo || (event.price || 0) * 100,
        currency: "NGN",
        ref: order.reference,
        metadata: {
          source_type: "event_ticket",
          source_id: event.id,
          ticket_id: order.ticketId,
          reference: order.reference,
          payer_name: formData.name,
          custom_fields: [
            {
              display_name: "Event Title",
              variable_name: "event_title",
              value: event.title
            },
            {
              display_name: "Attendee Name",
              variable_name: "attendee_name",
              value: formData.name
            }
          ]
        },
        callback: function(response: any) {
          console.log("Payment successful. Reference: " + response.reference);
          setIsPending(true);
          setFormError("");
          const poll = setInterval(async () => {
            const res = await verifyTicketPayment(order.reference || "");
            if (res.status === "confirmed" && res.passUrl) {
              clearInterval(poll);
              setPassInfo({ passUrl: res.passUrl, reference: order.reference || "" });
              setIsPending(false);
              setIsReserved(true);
            }
          }, 3000);
          setTimeout(() => {
            clearInterval(poll);
            setIsPending(false);
            setFormError("Payment received — verification is taking longer than usual. We'll confirm your pass by email shortly.");
          }, 60000);
        },
        onClose: function() {
          setIsPending(false);
          setFormError("Payment not confirmed yet — we're verifying your payment. Check back shortly.");
        }
      });
      handler.openIframe();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Payment could not start. Please try again.");
      setIsPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!validateForm()) return;
    setIsPending(true);
    setFormError("");

    if (event.isPaid) {
      await handlePaystackPayment();
    } else {
      const res = await registerForEvent({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        consent: consent.privacy,
      });
      if (res.error) {
        setFormError(res.error);
        setIsPending(false);
        if (res.error === "This event is sold out") {
          const { joinWaitlist } = await import("@/actions/waitlist");
          const wl = await joinWaitlist({
            eventId: event.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          });
          if (wl.error) {
            setFormError(wl.error);
          } else {
            setWaitlistMsg(`You're on the waitlist! If a spot opens up, ${formData.email} gets first claim.`);
          }
        }
        return;
      }
      setPassInfo({ passUrl: res.passUrl || "", reference: res.reference || "" });
      setIsPending(false);
      setIsReserved(true);
    }
  };

  if (!event) {
    notFound();
  }

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Events", href: "/events" }, { label: event.title }]} />

          <div className="mt-8 md:mt-12 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 flex-wrap">
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest">
                {event.isPaid ? `Ticket: ₦${(event.price || 0).toLocaleString()}` : "Registration Open"}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                <Calendar size={14} className="text-primary" /> {formatDisplayDate(event.date)}
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight max-w-4xl mx-auto lg:mx-0">
              {event.title}
            </h1>

            <p className="mt-6 md:mt-8 text-muted-foreground text-base md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {event.desc}
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 md:gap-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Location</p>
                  <p className="text-sm md:text-base font-bold text-secondary leading-tight">{event.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary shrink-0">
                  <Clock size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Start Time</p>
                  <p className="text-sm md:text-base font-bold text-secondary leading-tight">{event.time}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-10">
              <a href="#register" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                {event.isPaid ? `Purchase Pass (₦${(event.price || 0).toLocaleString()})` : "Reserve My Spot"}
              </a>
            </div>
          </div>

          {event.img ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-10 md:mt-16 relative aspect-[16/9] rounded-xl border border-border overflow-hidden"
            >
              <Image src={event.img} alt={event.title} fill className="object-cover" priority sizes="(max-width: 1280px) 100vw, 1280px" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-10 md:mt-16 relative aspect-[16/9] rounded-xl border border-border overflow-hidden bg-gradient-to-br from-secondary via-primary to-accent/40 flex items-center justify-center"
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(212,168,67,0.6) 0, transparent 45%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.15) 0, transparent 40%)" }} />
              <div className="relative text-center px-6">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-xl bg-card/10 border border-card/20 flex items-center justify-center text-card">
                  <Calendar size={26} className="md:w-8 md:h-8" />
                </div>
                <p className="mt-4 text-card text-[11px] font-bold uppercase tracking-widest">{event.category}</p>
                <p className="mt-1 text-card/60 text-xs font-medium">{event.isPaid ? `Ticket: ₦${(event.price || 0).toLocaleString()}` : "Free Entry"}</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ShareButtons title={event.title} url={shareUrl} />
      </div>

      {/* Main Content Area */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">

          <div className="lg:col-span-7 space-y-16 md:space-y-20">
            {/* The Vision */}
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-10 tracking-tight">The Vision</h3>
              <div className="prose prose-slate lg:prose-xl max-w-none text-secondary/90 text-lg md:text-xl leading-[1.8]">
                <ReactMarkdown>{event.longDesc}</ReactMarkdown>
              </div>
            </div>

            {/* What you'll get */}
            {event.features && event.features.length > 0 && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">What You&rsquo;ll Get</h3>
                <div className="flex flex-wrap gap-2.5">
                  {event.features.map((feat, i) => (
                    <div key={i} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-background border border-border">
                      <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="font-semibold text-secondary text-xs leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda */}
            {agenda.length > 0 && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Programme</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {agenda.map((item: { time: string; title: string }, i: number) => (
                    <div key={i} className="flex items-start gap-5 px-5 md:px-8 py-5 border-b border-border/50 last:border-b-0">
                      <span className="text-primary font-bold text-sm w-20 shrink-0 pt-0.5">{item.time}</span>
                      <span className="text-secondary text-sm md:text-base font-medium">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audience fit */}
            {(audienceFor.length > 0 || audienceNotFor.length > 0) && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Who It&rsquo;s For</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {audienceFor.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-5">This event is for</h4>
                      <ul className="space-y-3.5">
                        {audienceFor.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-secondary leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {audienceNotFor.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">This event is not for</h4>
                      <ul className="space-y-3.5">
                        {audienceNotFor.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <X size={16} className="text-destructive shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Booking Island */}
          <aside id="register" className="lg:col-span-5 scroll-mt-28">
            <div className="lg:sticky lg:top-32">
               {!isReserved ? (
                  <motion.div className="bg-card border border-border rounded-xl p-6 md:p-10">
                      <div className="text-center md:text-left mb-6 md:mb-10">
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-3 tracking-tight">Secure Your Pass</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{event.isPaid ? `One payment of ₦${(event.price || 0).toLocaleString()}. Instant confirmation and digital pass by email.` : "Reserve in seconds — free entry, instant confirmation by email."}</p>
                      </div>

                      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                          <div className="space-y-2 group">
                             <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-2 md:ml-4 group-focus-within:text-primary transition-colors duration-300">Full Name</label>
                             <input
                               type="text"
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               placeholder="Peace Jagaban"
                               className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold placeholder:text-muted-foreground/40"
                               required
                             />
                             {fieldErrors.name && <p className="text-sm font-bold text-red-500 px-2">{fieldErrors.name}</p>}
                          </div>
                          <div className="space-y-2 group">
                             <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-2 md:ml-4 group-focus-within:text-primary transition-colors duration-300">Email Address</label>
                             <input
                               type="email"
                               value={formData.email}
                               onChange={(e) => setFormData({...formData, email: e.target.value})}
                               placeholder="peace@bmacjos.org"
                               className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold placeholder:text-muted-foreground/40"
                               required
                             />
                             {fieldErrors.email && <p className="text-sm font-bold text-red-500 px-2">{fieldErrors.email}</p>}
                           </div>
                           <div className="space-y-2 group">
                              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-2 md:ml-4 group-focus-within:text-primary transition-colors duration-300">Phone (WhatsApp) — Optional</label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+234 803 456 7891"
                                className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold placeholder:text-muted-foreground/40"
                              />
                              {fieldErrors.phone && <p className="text-sm font-bold text-red-500 px-2">{fieldErrors.phone}</p>}
                            </div>

                           <ConsentCheckbox consentId="event" onChange={setConsent} />
                           {fieldErrors.consent && <p className="text-sm font-bold text-red-500 px-2">{fieldErrors.consent}</p>}

                           {formError && (
                             <p className="text-sm font-bold text-red-500 px-2">{formError}</p>
                           )}

                           {waitlistMsg && (
                             <p className="text-sm font-bold text-primary bg-primary/5 border border-primary/15 rounded-lg px-4 py-3">{waitlistMsg}</p>
                           )}

                           <button
                            disabled={isPending}
                            className="w-full py-4 bg-primary text-card rounded-lg font-bold text-sm md:text-base hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-3 mt-5 md:mt-8 disabled:opacity-70"
                          >
                              {isPending ? (
                                <div className="w-5 h-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>{event.isPaid ? `Purchase Pass (₦${(event.price || 0).toLocaleString()})` : "Request Official Pass"} <Send size={18} /></>
                              )}
                           </button>
                        </form>
                        <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
                          Instant confirmation and digital pass by email.
                          {event.policies ? <> See our <a href="#good-to-know" className="underline underline-offset-2 hover:text-primary transition-colors">policy</a> for cancellations.</> : null}
                        </p>
                   </motion.div>
               ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-xl p-8 md:p-12 text-center"
                  >
                       <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8">
                          <CheckCircle2 size={40} />
                       </div>
                       <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-4 tracking-tight">Reservation Confirmed</h3>
                       <p className="text-muted-foreground text-base mb-10 leading-relaxed">
                          Your digital pass has been generated. Check your email for the official QR code and entry details.
                       </p>

                        <div className="p-6 bg-background rounded-xl border border-border mb-8">
                           <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-muted-foreground">Entry ID</p>
                           <p className="font-mono text-xl font-extrabold text-primary">{passInfo?.reference || "—"}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                           <a href={passInfo?.passUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-primary text-card font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors text-center">
                              View Digital Pass
                           </a>
                           <button
                             onClick={handleAddToCalendar}
                             className="w-full py-4 bg-background border border-border text-secondary font-bold rounded-lg text-sm hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-2"
                           >
                             <CalendarPlus size={18} /> Add to Calendar (.ics)
                           </button>
                        </div>
                  </motion.div>
               )}
            </div>
          </aside>
        </div>
      </section>

      {/* Social Proof */}
      {publishedTestimonials.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-12 tracking-tight">Voices from our community</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publishedTestimonials.slice(0, 3).map((t, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <blockquote className="rounded-xl border border-border bg-card p-6 h-full">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="text-xs">
                      <p className="font-bold text-secondary">{t.name}</p>
                      <p className="text-muted-foreground mt-0.5">{t.designation}</p>
                    </footer>
                  </blockquote>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-12 tracking-tight text-center">Common Questions</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {faqs.map((faq: { q: string; a: string }, i: number) => (
                <div key={i} className="border-b border-border/50 last:border-b-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-bold text-secondary text-sm md:text-base">{faq.q}</span>
                    <span className={`text-primary text-xl font-bold transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {openFaq === i && <p className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Policies */}
      {policies && (
        <section id="good-to-know" className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 border-y border-border/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Good to Know</h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{policies}</p>
          </div>
        </section>
      )}

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-12 tracking-tight">More from BMAC</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((e, i) => (
                <FadeIn key={e.id} delay={i * 0.1}>
                  <Link
                    href={`/events/${e.id}`}
                    className="group block h-full rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
                  >
                    {e.img ? (
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border/50 mb-5">
                        <Image src={e.img} alt={e.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    ) : null}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest">
                        <Calendar size={12} /> {formatDisplayDate(e.date)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-secondary mb-3 leading-tight group-hover:text-primary transition-colors">
                      {e.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{e.desc}</p>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isReserved && showStickyCta && (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-card/95 backdrop-blur border-t border-border px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <a
            href="#register"
            className="block w-full py-3.5 bg-primary text-card rounded-lg text-sm font-bold text-center hover:bg-primary/90 transition-colors"
          >
            {event.isPaid ? `Purchase Pass (₦${(event.price || 0).toLocaleString()})` : "Reserve My Spot"}
          </a>
        </div>
      )}
    </main>
  );
}
