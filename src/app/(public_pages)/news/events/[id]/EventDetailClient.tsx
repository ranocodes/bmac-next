"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Send, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import ReactMarkdown from "react-markdown";
import { registerForEvent } from "@/actions/events";
import { createTicketOrder, getTicketStatus } from "@/actions/tickets";
import { loadPaystack } from "@/lib/paystack";
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
}

export default function EventDetailClient({ id, initialEvents }: EventDetailClientProps) {
  const all = initialEvents.map(e => ({
    ...e,
    date: (e as any).event_date || e.date || "",
    desc: e.desc || (e as any).description || "",
    features: (e as any).features || [],
    isPaid: (e as any).is_paid ?? (e as any).isPaid ?? false,
    price: Number((e as any).price || 0),
  }));
  const found = all.find(e => e.id === id) || null;
  const [event] = useState<EventPass | null>(found);
  const [isReserved, setIsReserved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [passInfo, setPassInfo] = useState<{ passUrl: string; reference: string } | null>(null);
  const [waitlistMsg, setWaitlistMsg] = useState("");

  const handlePaystackPayment = async () => {
    if (!event) return;
    try {
      const order = await createTicketOrder({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        quantity: 1,
        consent: true,
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
          const poll = setInterval(async () => {
            const res = await getTicketStatus(order.reference || "");
            if (res.status === "confirmed" && res.passUrl) {
              clearInterval(poll);
              setPassInfo({ passUrl: res.passUrl, reference: order.reference || "" });
              setIsPending(false);
              setIsReserved(true);
            }
          }, 3000);
          setTimeout(() => clearInterval(poll), 60000);
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
    setIsPending(true);
    setFormError("");

    if (event.isPaid) {
      await handlePaystackPayment();
    } else {
      const res = await registerForEvent({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        consent: true,
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Link href="/events" className="text-primary font-bold">Back to Events</Link>
        </div>
      </div>
    );
  }

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Editorial Event Hero */}
      <section className="relative overflow-hidden bg-secondary pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-primary/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-16">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <Link href="/events" className="inline-flex items-center gap-2 text-accent hover:text-card text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-8 md:mb-12 transition-colors group mx-auto lg:mx-0">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Access All Passes
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 md:mb-8">
                <span className="bg-accent text-accent-foreground px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                  {event.isPaid ? `Ticket: ₦${(event.price || 0).toLocaleString()}` : "Registration Open"}
                </span>
                <div className="flex items-center gap-2 text-card/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                  <Calendar size={12} className="text-accent" /> {formatDisplayDate(event.date)}
                </div>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,10vw,5.5rem)] font-extrabold text-card tracking-tighter leading-[0.95] md:leading-[0.85] mb-8 md:mb-10 max-w-4xl mx-auto lg:mx-0">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 md:gap-10">
                <div className="flex items-center gap-4 text-card/80">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent shrink-0 shadow-lg">
                    <MapPin size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-40">Location</p>
                     <p className="text-sm md:text-base font-bold leading-tight">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-card/80">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent shrink-0 shadow-lg">
                    <Clock size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-40">Start Time</p>
                     <p className="text-sm md:text-base font-bold leading-tight">{event.time}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          <div className="lg:col-span-7">
            <div className="prose prose-slate lg:prose-xl max-w-none mb-20 text-muted-foreground">
              <h3 className="font-display text-4xl font-extrabold text-secondary mb-10 tracking-tight">The Vision</h3>
              <div className="text-lg md:text-xl leading-[1.8] mb-12 font-medium overflow-x-auto">
                <ReactMarkdown>{event.longDesc}</ReactMarkdown>
              </div>

              {(event.features && event.features.length > 0) && (
                <div className="flex flex-wrap gap-2.5 mt-12">
                  {event.features.map((feat, i) => (
                    <div key={i} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/40 border border-border/40 shadow-xs hover:bg-card hover:border-border/70 hover:shadow-sm transition-all duration-300">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="font-semibold text-secondary text-xs leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking Island */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
               {!isReserved ? (
                  <motion.div 
                    layoutId="rsvp-card"
                    className="bg-gradient-to-br from-card to-muted/30 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-diffused border border-border/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-primary/5 rounded-full blur-3xl opacity-50 -mr-16 md:-mr-24 -mt-16 md:-mt-24 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 md:w-36 h-24 md:h-36 bg-accent/5 rounded-full blur-3xl opacity-30 -ml-12 md:-ml-18 -mb-12 md:-mb-18 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="text-center md:text-left mb-6 md:mb-10">
                        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-secondary mb-3 tracking-tight">Secure Your Pass</h3>
                        <p className="text-muted-foreground text-sm font-medium">Limited spots available for the 2026 cycle.</p>
                      </div>
                      
                      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                          <div className="space-y-2 group">
                             <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2 md:ml-4 group-focus-within:text-primary transition-colors duration-300">Legal Name</label>
                             <input 
                               type="text" 
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               placeholder="Peace Jagaban" 
                               className="w-full px-5 md:px-8 py-4 md:py-5 bg-background border border-border/60 rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold placeholder:text-muted-foreground/40" 
                               required 
                             />
                          </div>
                          <div className="space-y-2 group">
                             <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2 md:ml-4 group-focus-within:text-primary transition-colors duration-300">Communications</label>
                             <input 
                               type="email" 
                               value={formData.email}
                               onChange={(e) => setFormData({...formData, email: e.target.value})}
                               placeholder="peace@bmacjos.org" 
                               className="w-full px-5 md:px-8 py-4 md:py-5 bg-background border border-border/60 rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-bold placeholder:text-muted-foreground/40" 
                               required 
                             />
                           </div>

                           {formError && (
                             <p className="text-sm font-bold text-red-500 px-2">{formError}</p>
                           )}

                           {waitlistMsg && (
                             <p className="text-sm font-bold text-primary bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">{waitlistMsg}</p>
                           )}

                           <button 
                            disabled={isPending}
                            className="group relative w-full py-4 md:py-6 bg-gradient-to-r from-secondary to-primary text-card rounded-[1.5rem] md:rounded-[2rem] font-extrabold text-sm md:text-base hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-4 mt-5 md:mt-8 shadow-2xl disabled:opacity-70 active:scale-[0.98] overflow-hidden"
                          >
                             <span className="relative z-10 flex items-center gap-3 md:gap-4">
                                {isPending ? (
                                  <div className="w-5 h-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>{event.isPaid ? `Purchase Pass (₦${(event.price || 0).toLocaleString()})` : "Request Official Pass"} <Send size={18} className="md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /></>
                                )}
                             </span>
                             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                          </button>
                       </form>
                    </div>
                  </motion.div>
               ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary rounded-[3rem] p-12 text-center text-card shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
                    <div className="relative z-10">
                       <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center text-primary mx-auto mb-8 shadow-xl">
                          <CheckCircle2 size={40} />
                       </div>
                       <h3 className="font-display text-3xl font-extrabold mb-4 tracking-tighter">Reservation Confirmed</h3>
                       <p className="text-card/80 text-base mb-10 font-medium leading-relaxed">
                          Your digital pass has been generated. Check your email for the official QR code and entry details.
                       </p>
                       
                        <div className="p-6 bg-card/10 rounded-3xl border border-card/20 backdrop-blur-md mb-8">
                           <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Entry ID</p>
                           <p className="font-mono text-xl font-extrabold text-accent">{passInfo?.reference || "—"}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                           <a href={passInfo?.passUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-card text-primary font-bold rounded-2xl text-sm hover:bg-accent hover:text-secondary transition-all text-center">
                              View Digital Pass
                           </a>
                        </div>
                    </div>
                  </motion.div>
               )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
