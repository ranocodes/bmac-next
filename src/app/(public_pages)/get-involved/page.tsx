"use client";

import React, { useState } from "react";
import {
  Users,
  HeartHandshake,
  Banknote,
  Handshake,
  School,
  ArrowRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import { applyAsPerson } from "@/actions/people";
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
  const [formData, setFormData] = useState({ name: "", email: "", company_website: "", notes: "" });
  const [formError, setFormError] = useState("");
  const [consent, setConsent] = useState({ privacy: false, marketing: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    title: string;
    message: string;
    reference?: string;
  } | null>(null);
  const { toast } = useToast();

  const openWay = (way: Way) => {
    setFormError("");
    setSubmitted(null);
    setConsent({ privacy: false, marketing: false });
    setSelectedWay(way);
  };

  const closeModal = () => {
    setSubmitted(null);
    setSelectedWay(null);
    setConsent({ privacy: false, marketing: false });
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
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        setFormError("Payments are not configured yet. Please try again later.");
        setIsSubmitting(false);
        return;
      }
      const reference = `BMAC-${Math.floor((Math.random() * 1000000000) + 1)}`;
      const { createPendingDonation } = await import("@/actions/donations");
      const pending = await createPendingDonation({
        name: formData.name,
        email: formData.email,
        amount: amountN,
        reference,
        company_website: formData.company_website,
      });
      if (pending.error || !pending.donation) {
        setFormError(pending.error || "Could not start donation. Please try again.");
        setIsSubmitting(false);
        return;
      }
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: paystackKey,
        email: formData.email,
        amount: amountN * 100,
        currency: "NGN",
        ref: reference,
        metadata: {
          source_type: "donation",
          source_id: "get-involved",
          payer_name: formData.name,
          record_id: pending.donation.recordId,
        },
        callback: function() {
          setIsSubmitting(false);
          setSubmitted({ title: "Payment Initiated", message: "Donation received. Thank you! 🎉", reference });
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
        notes: formData.notes,
        privacy: consent.privacy,
        marketing: consent.marketing,
        company_website: formData.company_website,
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
    setSubmitted({
      title: "Application Sent!",
      message: "We've received your application and will get back to you within 48 hours.",
    });
    toast("Application sent! We'll review it and get back to you soon.", "success");
  };
  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-6 w-full text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">
              Movement of Minds
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight">
              Empower <span className="text-primary">The Future</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* CMS-READY UNIFORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ways.map((way, i) => (
              <BentoCard
                key={way.id}
                delay={i * 0.1}
                className="flex flex-col h-full bg-card border border-border rounded-xl hover:border-primary/40 transition-colors"
                onClick={() => openWay(way)}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-lg ${way.color} flex items-center justify-center mb-6`}>
                    {way.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-secondary mb-3 tracking-tight">
                    {way.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">
                    {way.desc}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Learn More
                    </span>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-card transition-colors">
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
                   <span className="text-[11px] font-bold uppercase tracking-widest text-primary block mb-3 md:mb-2">
                     Action Step
                   </span>
                   <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary tracking-tight leading-tight">
                     {selectedWay.title}
                   </h2>
                 </div>
                 <div className={`p-4 md:p-5 rounded-lg ${selectedWay.color} order-1 md:order-2 mx-auto md:mx-0`}>
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
                     <div key={i} className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground bg-card px-5 py-4 rounded-lg border border-border hover:border-primary/40 transition-colors">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                       <span className="font-bold">{detail}</span>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Form Section */}
              <div className="p-8 md:p-12 bg-background">
                
                <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-8 text-center md:text-left">
                   {selectedWay.id === "donate" ? "Gift of Growth" : "Secure Connection"}
                </h3>

                {selectedWay.id === "donate" && (
                  <div className="space-y-6 mb-8">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["5000", "10000", "25000", "custom"].map((amt) => (
                        <button
                          key={amt}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors border ${
                            donateAmount === amt 
                              ? "bg-primary border-primary text-card" 
                              : "bg-background border-border text-secondary hover:border-primary/40"
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
                            className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Link
                      href="/donor-lookup"
                      className="block text-center md:text-left text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors mt-4"
                    >
                      Already donated? Look up your donations & receipts →
                    </Link>
                  </div>
                )}

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>
                    <p className="font-display text-2xl font-bold text-secondary mb-2">
                      {submitted.title}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                      {submitted.message}
                    </p>
                    {submitted.reference && (
                      <a
                        href={`/api/receipts/${encodeURIComponent(submitted.reference)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary/5 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileText size={15} />
                        Download Receipt (PDF)
                      </a>
                    )}
                    <button
                      onClick={() => { setSubmitted(null); setSelectedWay(null); }}
                      className="mt-8 px-6 py-3 bg-muted text-secondary hover:bg-muted/70 rounded-lg text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="company_website">Website</label>
                    <input
                      type="text"
                      id="company_website"
                      name="company_website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.company_website}
                      onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Your Identity</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Communication</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Why you&apos;d like to join <span className="normal-case">(optional)</span></label>
                    <textarea
                      placeholder="Tell us about your motivation, skills, or what you hope to contribute..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>
                  {formError && (
                    <p className="text-xs font-bold text-red-500 px-2">{formError}</p>
                  )}
                  <ConsentCheckbox
                    privacy={consent.privacy}
                    marketing={consent.marketing}
                    onChange={setConsent}
                    consentId={`get-involved-${selectedWay.id}`}
                  />
                  <button
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-card font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 mt-6 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
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
