"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Users, Clock, Send, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import type { Program } from "@/types/cms";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMapper";
import { submitApplication, createProgramOrder, getProgramPaymentStatus } from "@/actions/programs";
import { loadPaystack } from "@/lib/paystack";

interface ProgramDetailClientProps {
  id: string;
  initialPrograms: any[];
}

export default function ProgramDetailClient({ id, initialPrograms }: ProgramDetailClientProps) {
  const all = initialPrograms.map(p => ({
    ...p,
    desc: (p as any).desc || (p as any).description || "",
    img: (p as any).img || (p as any).img_url || "",
    icon: (p as any).icon || (p as any).icon_name || "",
    color: (p as any).color || (p as any).color_class || "",
    skills: (p as any).skills || [],
    faqs: (p as any).faqs || [],
    landingPage: (p as any).landingPage || false,
    status: (p as any).status || "draft",
    applicationsOpen: (p as any).applications_open ?? (p as any).applicationsOpen ?? false,
    isPaid: (p as any).is_paid ?? (p as any).isPaid ?? false,
    price: Number((p as any).price || 0),
  }));
  const [program] = useState<Program | null>(all.find(p => p.id === id && p.status === "published") || null);
  const [otherPathways] = useState<Program[]>(all.filter(p => p.id !== id && p.status === "published").slice(0, 3));
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", motivation: "" });
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;
    setIsPending(true);
    setFormError("");

    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;
    const base = {
      programId: program.id,
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      motivation: formData.motivation,
      consent,
    };

    if (program.isPaid) {
      const order = await createProgramOrder(base);
      if (order.error) {
        setFormError(order.error);
        setIsPending(false);
        return;
      }
      try {
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
          amount: order.amountKobo || (program.price || 0) * 100,
          currency: "NGN",
          ref: order.reference,
          metadata: {
            source_type: "program",
            source_id: program.id,
            application_id: order.applicationId,
            reference: order.reference,
            payer_name: formData.name,
            custom_fields: [
              {
                display_name: "Program Title",
                variable_name: "program_title",
                value: program.title,
              },
              {
                display_name: "Applicant Name",
                variable_name: "applicant_name",
                value: formData.name,
              },
            ],
          },
          callback: function(response: any) {
            console.log("Payment successful. Reference: " + response.reference);
            setIsPending(true);
            const poll = setInterval(async () => {
              const res = await getProgramPaymentStatus(order.reference || "");
              if (res.status === "completed") {
                clearInterval(poll);
                setApplicationId(res.applicationId || "");
                setIsPending(false);
                setSubmitted(true);
              }
            }, 3000);
            setTimeout(() => clearInterval(poll), 60000);
          },
          onClose: function() {
            setIsPending(false);
            setFormError("Payment not confirmed yet — we're verifying your payment. Check back shortly.");
          },
        });
        handler.openIframe();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Payment could not start. Please try again.");
        setIsPending(false);
      }
    } else {
      const res = await submitApplication(base);
      if (res.error) {
        setFormError(res.error);
        setIsPending(false);
        return;
      }
      setApplicationId(res.applicationId || "");
      setIsPending(false);
      setSubmitted(true);
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Program Not Found</h2>
          <Link href="/programs" className="text-primary font-bold">Back to Curriculum</Link>
        </div>
      </div>
    );
  }

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-6 overflow-hidden bg-card text-center md:text-left">
        <div className="absolute inset-0 bg-primary/5 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--secondary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center relative z-10">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Link href="/programs" className="lg:hidden inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/programs" className="hidden lg:inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-bold uppercase tracking-widest mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className={cn("p-3 rounded-2xl shadow-sm hidden md:block", program.color)}>
                  <div className="w-6 h-6 flex items-center justify-center">
                    {getIcon(program.icon as string, { size: 24 })}
                  </div>
                </div>
                <span className="text-accent font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
                  Official BMAC Program
                </span>
                <span className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border ${
                  program.isPaid
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                }`}>
                  {program.isPaid ? `₦${(program.price || 0).toLocaleString()}` : "Free"}
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,8vw,4.5rem)] font-extrabold text-secondary tracking-tighter leading-[0.95] mb-6 lg:mb-8">
                {program.title}
              </h1>

              <p className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {program.desc}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative h-[300px] md:h-[450px] lg:h-[500px] rounded-bento overflow-hidden shadow-2xl border-4 md:border-8 border-card order-1 lg:order-2"
          >
            <Image src={program.img} alt={program.title} fill className="object-cover" priority />
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24">
          
          <div className="lg:col-span-7">
            <div className="prose prose-slate lg:prose-lg max-w-none mb-12 md:mb-16 text-center md:text-left">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6">Overview</h3>
              <p className="text-muted-foreground text-base md:text-lg leading-[1.7] md:leading-[1.8] mb-8">
                {program.longDesc}
              </p>
            </div>

            <div className="mb-12 md:mb-16">
               <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-8 text-center md:text-left">What You'll Master</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {(program.skills?.length ? program.skills : [
                    "Commanding presence and stage authority",
                    "Advanced rhetorical techniques",
                    "Critical thinking and rapid response",
                    "Emotional connection with any audience",
                    "Professional storytelling frameworks",
                    "Leadership communication strategies"
                  ]).map((skill, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 md:p-5 rounded-xl bg-card border border-border shadow-sm transition-transform hover:-translate-y-1">
                       <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                       <span className="text-[11px] md:text-sm font-bold text-secondary">{skill}</span>
                    </div>
                  ))}
               </div>
            </div>

            <hr className="border-border/50 mb-12 md:mb-16" />

            <div className="bg-muted/50 rounded-[2rem] md:rounded-bento p-6 md:p-12 border border-border text-center md:text-left">
               <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-4">Common Questions</h3>
               <div className="space-y-3 md:space-y-4 text-left">
               {(program.faqs?.length ? program.faqs : [
                    { q: "Is this workshop for beginners?", a: "Absolutely. We have specialized modules designed specifically for those starting their journey." },
                    { q: "Are there any fees?", a: "Most BMAC programs are free for active members. Public competitions may have small registration fees." }
                  ]).map((faq, i) => (
                    <div key={i} className="bg-card p-5 md:p-6 rounded-xl shadow-sm border border-border">
                       <p className="font-bold text-secondary text-sm md:text-base mb-2">{faq.q}</p>
                       <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6 md:space-y-12">
            <div className="lg:sticky lg:top-32 space-y-6 md:space-y-12">
               
               {/* Logistics Widget */}
               <div className="bg-secondary rounded-[2rem] md:rounded-bento p-6 md:p-10 text-secondary-foreground relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20" />
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Workshop <br className="hidden md:block"/> Logistics</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 relative z-10">
                    {program.details.split('|').filter(s => s.trim()).map((detail, i) => (
                      <div key={i} className="flex items-center gap-4 md:gap-5 justify-start">
                         <div className="w-10 h-10 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent flex-shrink-0">
                            <Clock size={18} />
                         </div>
                         <p className="text-xs md:text-sm font-bold leading-tight">{detail}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* RSVP Form */}
               <div className="bg-gradient-to-br from-card to-muted/30 rounded-[2rem] md:rounded-bento p-6 md:p-10 lg:p-12 shadow-2xl border border-border relative overflow-hidden text-center md:text-left">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50 -mr-24 -mt-24 pointer-events-none" />
                   <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl opacity-30 -ml-16 -mb-16 pointer-events-none" />
                   <div className="relative z-10">
                     <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-2">Secure Your Spot</h3>
                     <p className="text-muted-foreground text-xs md:text-sm mb-8 leading-relaxed">
                       {program.isPaid
                         ? `Pay ₦${(program.price || 0).toLocaleString()} to reserve your place in the next cohort.`
                         : "Join the next cohort of ambassadors gathering in Jos."}
                     </p>
                     
                   {!program.applicationsOpen ? (
                      <div className="text-center py-8">
                        <p className="font-display text-lg font-bold text-secondary mb-1">Applications Closed</p>
                        <p className="text-xs text-muted-foreground">This program is not currently accepting applications. Check back soon.</p>
                      </div>
                    ) : submitted ? (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={28} className="text-emerald-600" />
                        </div>
                        <p className="font-display text-lg font-bold text-secondary mb-1">{program.isPaid ? "Payment Received!" : "Application Sent!"}</p>
                        <p className="text-xs text-muted-foreground">We'll reach out within 48 hours.</p>
                        {applicationId && (
                          <p className="text-[10px] font-mono text-muted-foreground/60 mt-3">Ref: {applicationId}</p>
                        )}
                      </div>
                    ) : (
                      <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2 text-left group">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors duration-300">Full Name</label>
                           <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ambassador Name" className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40" required />
                        </div>
                        <div className="space-y-2 text-left group">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors duration-300">Email Address</label>
                           <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@bmacjos.org" className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40" required />
                        </div>
                        <div className="space-y-2 text-left group">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors duration-300">Phone (Optional)</label>
                           <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+234..." className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40" />
                        </div>
                        <div className="space-y-2 text-left group">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors duration-300">Why Do You Want to Join?</label>
                           <textarea value={formData.motivation} onChange={(e) => setFormData({...formData, motivation: e.target.value})} rows={3} placeholder="Tell us a little about yourself and why this program matters to you..." className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 resize-none" required />
                        </div>
                        <label className="flex items-start gap-3 text-left cursor-pointer">
                           <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" required />
                           <span className="text-[10px] text-muted-foreground leading-relaxed">I consent to BMAC contacting me about this application and storing my details in line with our privacy policy.</span>
                        </label>
                        {formError && (
                          <p className="text-xs font-bold text-red-500 px-2">{formError}</p>
                        )}
                        <button disabled={isPending} className="group relative w-full py-4 md:py-5 bg-gradient-to-r from-secondary to-primary text-card rounded-xl md:rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-secondary/10 mt-4 active:scale-[0.98] overflow-hidden disabled:opacity-70">
                           <span className="relative z-10 flex items-center gap-3">
                              {isPending ? (
                                <div className="w-5 h-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>{program.isPaid ? `Pay ₦${(program.price || 0).toLocaleString()} & Register` : "Apply to Program"} <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /></>
                              )}
                           </span>
                           <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                         </button>
                      </form>)}
                    </div>
                </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Other Growth Pathways */}
      {otherPathways.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-secondary tracking-tight mb-12">Other Growth Pathways</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {otherPathways.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                      <Link href={`/programs/${item.id}`} className="group block h-full">
                        <BentoCard className="bg-card p-8 h-full flex flex-col items-center border-none shadow-sm hover:shadow-lg transition-all rounded-[2rem]">
                            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-6 shrink-0`}>
                              {getIcon(item.icon as string, { size: 24 })}
                            </div>
                            <h3 className="font-display text-lg font-bold text-secondary group-hover:text-primary transition-colors leading-tight mb-3 text-center">
                              {item.title}
                           </h3>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2 text-center">
                              {item.desc}
                            </p>
                        </BentoCard>
                      </Link>
                  </FadeIn>
                ))}
              </div>
          </div>
        </section>
      )}
    </main>
  );
}
