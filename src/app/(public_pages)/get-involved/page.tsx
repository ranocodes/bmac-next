"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  HeartHandshake,
  Banknote,
  Handshake,
  School,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";
import { applyAsPerson, resendGoogleFormLink } from "@/actions/people";
import { loadPaystack } from "@/lib/paystack";
import { ToastProvider, useToast } from "@/components/ui/Toast";

interface Way {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactElement<{ size?: number | string }>;
  color: string;
  details: string;
}

const ways: Way[] = [
  {
    id: "join",
    title: "Join BMAC",
    desc: "Become a member and access workshops, mentorship, and a vibrant community of young leaders.",
    icon: <Users size={24} />,
    color: "bg-emerald-50 text-emerald-600",
    details: "Open to ages 16-30|Quarterly cohorts|Annual dues: ₦2,000|Access to all programs|Community network|Leadership opportunities",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    desc: "Share your skills as a facilitator, event coordinator, or mentor for our members.",
    icon: <HeartHandshake size={24} />,
    color: "bg-amber-50 text-amber-600",
    details: "Flexible time commitment|No minimum hours|Training provided|Certificate of service|Community impact recognition",
  },
  {
    id: "school",
    title: "School Chapter",
    desc: "Bring the BMAC movement to your school or university to empower your fellow students.",
    icon: <School size={24} />,
    color: "bg-indigo-50 text-indigo-600",
    details: "Student-led leadership|Official BMAC accreditation|Curriculum support|Inter-school networking|Chapter events",
  },
  {
    id: "donate",
    title: "Donate",
    desc: "Support our mission financially to fund workshops and community outreach programs.",
    icon: <Banknote size={24} />,
    color: "bg-rose-50 text-rose-600",
    details: "₦5,000 sponsors one workshop|₦25,000 funds a scholarship|Tax-deductible receipts|Quarterly impact reports",
  },
  {
    id: "partner",
    title: "Partner With Us",
    desc: "Organizations can partner with us to amplify youth empowerment in Plateau State.",
    icon: <Handshake size={24} />,
    color: "bg-blue-50 text-blue-600",
    details: "Custom partnership tiers|Brand visibility at events|Co-branded programs|Impact metrics reporting",
  },
];

function GetInvolvedInner() {
  const [selectedWay, setSelectedWay] = useState<Way | null>(null);
  const [donateAmount, setDonateAmount] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    title: string;
    message: string;
    formLink?: string;
    email?: string;
    kind?: "member" | "volunteer" | "partner" | "program";
  } | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => () => {
    if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
  }, []);

  const openWay = (way: Way) => {
    setFormError("");
    setSubmitted(null);
    setSelectedWay(way);
  };

  const closeModal = () => {
    setSubmitted(null);
    setSelectedWay(null);
    if (resendCooldownRef.current) clearInterval(resendCooldownRef.current);
    setResendCooldown(0);
  };

  const handlePaystackDonation = async () => {
    const finalAmount = donateAmount === "custom" ? customAmount : donateAmount;
    const amountN = parseInt(finalAmount || "0", 10);
    if (!amountN || amountN <= 0) {
      setFormError("Enter a valid amount");
      setIsSubmitting(false);
      return;
    }
    try {
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
        email: formData.email,
        amount: amountN * 100,
        currency: "NGN",
        ref: `BMAC-${Math.floor((Math.random() * 1000000000) + 1)}`,
        metadata: {
          source_type: "donation",
          source_id: "get-involved",
          payer_name: formData.name,
        },
        callback: function() {
          setIsSubmitting(false);
          setSubmitted({ title: "Payment Initiated", message: "Donation received. Thank you! 🎉" });
        },
        onClose: function() {
          setIsSubmitting(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Payment could not start. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWay) return;
    setFormError("");
    setIsSubmitting(true);

    if (selectedWay.id === "donate") {
      await handlePaystackDonation();
      return;
    }

    const kindMap: Record<string, "member" | "volunteer" | "partner" | "program"> = {
      join: "member",
      volunteer: "volunteer",
      partner: "partner",
      school: "program",
    };
    const kind = kindMap[selectedWay.id] || "member";

    let res;
    try {
      res = await applyAsPerson({
        kind,
        name: formData.name,
        email: formData.email,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }
    if (res.error) {
      setFormError(res.error);
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    if (res.emailSent && res.formLink) {
      toast("Application sent! Check your email for your form link.", "success");
      setSubmitted({
        title: "Application Sent!",
        message: "Check your email — we've sent you a link to complete the next step.",
        formLink: res.formLink,
        email: formData.email.trim(),
        kind,
      });
    } else {
      setSubmitted({
        title: "Application Sent!",
        message: "We'll review your application and get back to you within 48 hours.",
      });
    }
  };

  const handleResendLink = async () => {
    if (!submitted?.email || !submitted.kind || resending || resendCooldown > 0) return;
    setResending(true);
    try {
      const res = await resendGoogleFormLink({
        kind: submitted.kind,
        email: submitted.email,
      });
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Link sent! Check your email inbox.", "success");
        setResendCooldown(60);
        resendCooldownRef.current = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1 && resendCooldownRef.current) clearInterval(resendCooldownRef.current);
            return prev <= 1 ? 0 : prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not resend the link. Please try again.", "error");
    } finally {
      setResending(false);
    }
  };
  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="relative min-h-[50dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-secondary/5" style={{ backgroundImage: 'radial-gradient(var(--secondary) 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Movement of Minds
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
              Empower <span className="text-primary italic font-light serif">The Future</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* CMS-READY UNIFORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ways.map((way, i) => (
              <BentoCard
                key={way.id}
                delay={i * 0.1}
                className="flex flex-col h-full bg-card border-none shadow-sm hover:shadow-xl transition-all"
                onClick={() => openWay(way)}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-2xl ${way.color} flex items-center justify-center mb-6`}>
                    {way.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-secondary mb-3 tracking-tight">
                    {way.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">
                    {way.desc}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      Learn More
                    </span>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Modal */}
      <Modal isOpen={!!selectedWay} onClose={closeModal}>
        {selectedWay && (
          <div className="bg-card">
            {/* Modal Header */}
            <div className="p-8 md:p-12 pb-0 md:pb-0">
               <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8 md:mb-12">
                 <div className="order-2 md:order-1 text-center md:text-left w-full md:w-auto">
                   <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase block mb-3 md:mb-2">
                     Action Step
                   </span>
                   <h2 className="font-display text-3xl md:text-5xl font-extrabold text-secondary tracking-tighter leading-[0.95]">
                     {selectedWay.title}
                   </h2>
                 </div>
                 <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl ${selectedWay.color} order-1 md:order-2 mx-auto md:mx-0 shadow-sm`}>
                   {React.cloneElement(selectedWay.icon, { size: 32 })}
                 </div>
               </div>
               
               <p className="text-muted-foreground text-base md:text-xl mb-10 md:mb-16 leading-relaxed max-w-2xl mx-auto md:mx-0 text-center md:text-left font-medium">
                 {selectedWay.desc}
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-border/50">
              {/* Expectations Section */}
              <div className="p-8 md:p-12 bg-muted/20">
                 <h4 className="font-bold text-secondary uppercase text-[10px] tracking-widest mb-6 text-center md:text-left">What to Expect</h4>
                 <div className="grid grid-cols-1 gap-3">
                   {selectedWay.details.split("|").map((detail: string, i: number) => (
                     <div key={i} className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground bg-card px-5 py-4 rounded-xl border border-border/30 shadow-sm transition-transform hover:scale-[1.02]">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                       <span className="font-bold">{detail}</span>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Form Section */}
              <div className="p-8 md:p-12 bg-secondary text-secondary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20" />
                
                <h3 className="relative z-10 font-display text-xl md:text-2xl font-bold mb-8 text-center md:text-left">
                   {selectedWay.id === "donate" ? "Gift of Growth" : "Secure Connection"}
                </h3>

                {selectedWay.id === "donate" && (
                  <div className="space-y-6 mb-8 relative z-10">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["5000", "10000", "25000", "custom"].map((amt) => (
                        <button
                          key={amt}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                            donateAmount === amt 
                              ? "bg-accent border-accent text-accent-foreground shadow-lg shadow-accent/20" 
                              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                          }`}
                          onClick={() => setDonateAmount(amt)}
                        >
                          {amt === "custom" ? "Custom" : `₦${parseInt(amt).toLocaleString()}`}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {donateAmount === "custom" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <input
                            type="number"
                            placeholder="Enter amount (₦)"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>
                    <p className="font-display text-2xl font-bold text-white mb-2">
                      {submitted.title}
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                      {submitted.message}
                    </p>
                    {submitted.formLink && (
                      <a
                        href={submitted.formLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground text-sm font-bold rounded-xl shadow-lg shadow-accent/20 transition-all hover:opacity-90"
                      >
                        Open Application Form <ArrowRight size={16} />
                      </a>
                    )}
                    {submitted.email && submitted.kind && (
                      <button
                        onClick={handleResendLink}
                        disabled={resending || resendCooldown > 0}
                        className="mt-4 w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail size={15} />
                        {resending ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : resendCooldown > 0 ? (
                          `Request link again (${resendCooldown}s)`
                        ) : (
                          "Request link again"
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => { setSubmitted(null); setSelectedWay(null); }}
                      className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form className="space-y-4 md:space-y-5 relative z-10" onSubmit={handleSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-2">Your Identity</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 md:px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-2">Communication</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 md:px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-all"
                      required
                    />
                  </div>
                  {formError && (
                    <p className="text-xs font-bold text-red-300 px-2">{formError}</p>
                  )}
                  <button
                    disabled={isSubmitting}
                    className="w-full py-4 md:py-5 bg-accent text-accent-foreground font-bold rounded-xl md:rounded-2xl text-sm hover:bg-card hover:text-accent transition-all flex items-center justify-center gap-3 mt-6 shadow-xl shadow-accent/10 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>{selectedWay.id === "donate" ? "Complete Donation" : "Initiate Partnership"} <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default function GetInvolved() {
  return (
    <ToastProvider>
      <GetInvolvedInner />
    </ToastProvider>
  );
}
