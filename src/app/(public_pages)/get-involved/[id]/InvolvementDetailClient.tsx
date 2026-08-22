"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap,
  Users,
  Heart,
  Clock,
  Shield,
  Award,
  TrendingUp,
  Rocket,
  BookOpen,
  Globe,
  BadgeCheck,
  Target,
  Eye,
  Receipt,
  Star,
  Layers,
  Package,
  BarChart,
  FileText,
  Banknote,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { loadPaystack } from "@/lib/paystack";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import type { InvolvementPage, InvolvementSection } from "@/actions/involvement-pages";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Calendar, Zap, Users, Heart, Clock, Shield, Award, TrendingUp,
  Rocket, BookOpen, Globe, BadgeCheck, Target, Eye, Receipt, Star,
  Layers, Package, BarChart, Banknote, FileText,
};

function resolveIcon(name: string | null) {
  if (!name) return Zap;
  return ICON_MAP[name] || Zap;
}

const ACCENT_MAP: Record<string, { gradient: string; ring: string; bg: string; badge: string; solid: string }> = {
  emerald: { gradient: "from-zinc-900 to-zinc-700", ring: "ring-zinc-800", bg: "bg-zinc-900", badge: "bg-zinc-900 text-white", solid: "bg-zinc-900 text-white" },
  amber: { gradient: "from-zinc-900 to-zinc-700", ring: "ring-zinc-800", bg: "bg-zinc-900", badge: "bg-zinc-900 text-white", solid: "bg-zinc-900 text-white" },
  indigo: { gradient: "from-zinc-900 to-zinc-700", ring: "ring-zinc-800", bg: "bg-zinc-900", badge: "bg-zinc-900 text-white", solid: "bg-zinc-900 text-white" },
  rose: { gradient: "from-zinc-900 to-zinc-700", ring: "ring-zinc-800", bg: "bg-zinc-900", badge: "bg-zinc-900 text-white", solid: "bg-zinc-900 text-white" },
  blue: { gradient: "from-zinc-900 to-zinc-700", ring: "ring-zinc-800", bg: "bg-zinc-900", badge: "bg-zinc-900 text-white", solid: "bg-zinc-900 text-white" },
};

const DONATE_AMOUNTS = ["5000", "10000", "25000", "50000", "custom"];

interface Props {
  page: InvolvementPage;
  slug: string;
  entityType: string | null;
  googleForms?: Record<string, string>;
}

function InvolvementDetailInner({ page, slug, googleForms }: Props) {
  const accent = ACCENT_MAP[page.accent_color || "emerald"] || ACCENT_MAP.emerald;
  const HeroIcon = resolveIcon(page.icon);
  const { toast } = useToast();

  const [donateName, setDonateName] = useState("");
  const [donateEmail, setDonateEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const [donateAmount, setDonateAmount] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");

  const isDonate = slug === "donate";
  const googleFormUrl = googleForms?.[slug] || "";

  const openForm = () => {
    if (googleFormUrl) {
      const url = /^https?:\/\//.test(googleFormUrl) ? googleFormUrl : `https://${googleFormUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDonate) {
      handleDonate();
      return;
    }
    openForm();
  };

  const handleDonate = async () => {
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
        setFormError("Payments are not configured yet.");
        setIsSubmitting(false);
        return;
      }
      const reference = `BMAC-${Math.floor(Math.random() * 1000000000 + 1)}`;
      const { createPendingDonation } = await import("@/actions/donations");
      const pending = await createPendingDonation({
        name: donateName,
        email: donateEmail,
        amount: amountN,
        reference,
      });
      if (pending.error || !pending.donation) {
        setFormError(pending.error || "Could not start donation.");
        setIsSubmitting(false);
        return;
      }
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: paystackKey,
        email: donateEmail,
        amount: amountN * 100,
        currency: "NGN",
        ref: reference,
        metadata: {
          source_type: "donation",
          source_id: slug,
          payer_name: donateName,
          record_id: pending.donation.recordId,
        },
        callback: function () {
          setIsSubmitting(false);
          setSubmitted(true);
          toast("Donation received. Thank you!", "success");
        },
        onClose: function () {
          setIsSubmitting(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Payment could not start.");
      setIsSubmitting(false);
    }
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } };

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-background border-b border-border/40">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-36 pb-10 md:pb-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-secondary transition-colors mb-8 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Get Involved
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-4 md:p-6 rounded-lg ${accent.bg} ring-1 ${accent.ring} shrink-0`}
            >
              <HeroIcon size={32} className="text-background md:w-10 md:h-10" />
            </motion.div>

            <div className="flex-1">
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3 block"
              >
                Get Involved
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-[1.1]"
              >
                {page.title}
              </motion.h1>
              {page.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                  {page.subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HERO DESCRIPTION */}
      {page.hero_description && (
        <section className="border-b border-border/40 bg-background">
          <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl"
            >
              {page.hero_description}
            </motion.p>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* SECTIONS GRID */}
        {page.sections.length > 0 && (
          <section className="py-10 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                What You Get
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary tracking-tight">
                Everything you need to know
              </h2>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {page.sections.map((section: InvolvementSection, i: number) => {
                const SIcon = resolveIcon(section.icon);
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    className="group relative bg-background border border-border/60 rounded-xl p-5 md:p-8 hover:border-secondary transition-all duration-300"
                  >
                    <div className="flex items-start gap-5">
                      <div className={`p-3 rounded-lg ${accent.bg} ring-1 ${accent.ring} shrink-0`}>
                        <SIcon size={20} className="text-background" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-secondary mb-2 tracking-tight">
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>
        )}

        {/* BENEFITS */}
        {page.benefits.length > 0 && (
          <section className="pb-10 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-xl border border-border/60 bg-background p-5 md:p-12"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
              <div className="relative">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                  At a Glance
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary tracking-tight mb-8">
                  Key Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {page.benefits.map((benefit: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 bg-background rounded-xl px-5 py-4 border border-border/40"
                    >
                      <CheckCircle2 size={16} className="text-secondary mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-secondary leading-snug">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>

      {/* FORM SECTION */}
      <section className="border-t border-border/50 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
            {/* FORM HEADER */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:sticky lg:top-28"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                  Ready?
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary tracking-tight mb-4">
                  {isDonate ? "Make Your Donation" : "Submit Your Application"}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  {isDonate
                    ? "Choose an amount below. All donations are tax-deductible and go directly toward empowering young leaders."
                    : "Fill out the form and we'll review your application within 48 hours. We're excited to have you on board."}
                </p>

                {page.benefits.length > 0 && !isDonate && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">What happens next</p>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className={`w-6 h-6 rounded-full ${accent.badge} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>1</div>
                      <span>Submit your application</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className={`w-6 h-6 rounded-full ${accent.badge} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>2</div>
                      <span>Review within 48 hours</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className={`w-6 h-6 rounded-full ${accent.badge} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>3</div>
                      <span>Welcome to the community</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* FORM CARD */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background border border-border/60 rounded-xl p-5 md:p-10"
              >
                {submitted ? (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className={`w-20 h-20 rounded-full ${accent.bg} flex items-center justify-center mx-auto mb-6 ring-1 ${accent.ring}`}
                    >
                      <CheckCircle2 size={36} className="text-background" />
                    </motion.div>
                    <h3 className="font-display text-2xl font-bold text-secondary mb-3">
                      {isDonate ? "Thank You!" : "Application Sent!"}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-8">
                      {isDonate
                        ? "Your generosity fuels the future. We'll send you a receipt and impact report."
                        : "We've received your application and will get back to you within 48 hours."}
                    </p>
                    <Link
                      href="/get-involved"
                      className={`inline-flex items-center gap-2 px-6 py-3 ${accent.solid} text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity`}
                    >
                      <ArrowLeft size={16} />
                      Back to Get Involved
                    </Link>
                  </div>
                ) : isDonate ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot */}
                    <div className="absolute left-[-9999px]" aria-hidden="true">
                      <label htmlFor="company_website">Website</label>
                      <input type="text" id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-secondary">Your Name <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Amina Yusuf"
                        value={donateName}
                        onChange={(e) => setDonateName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-background border border-border/60 rounded-xl text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-secondary">Email Address <span className="text-muted-foreground font-normal">(optional — for receipt)</span></label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={donateEmail}
                        onChange={(e) => setDonateEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-background border border-border/60 rounded-xl text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="space-y-3 pt-2">
                      <label className="block text-sm font-semibold text-secondary">Donation Amount</label>
                      <div className="flex flex-wrap gap-2">
                        {DONATE_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              donateAmount === amt
                                ? `${accent.solid} border-transparent text-white shadow-md`
                                : "bg-background border-border text-secondary hover:border-primary/40"
                            }`}
                            onClick={() => setDonateAmount(amt)}
                          >
                            {amt === "custom" ? "Custom" : `\u20A6${parseInt(amt).toLocaleString()}`}
                          </button>
                        ))}
                      </div>
                      {donateAmount === "custom" && (
                        <input
                          type="number"
                          placeholder="Enter amount (\u20A6)"
                          className="w-full px-4 py-3.5 bg-background border border-border/60 rounded-xl text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      )}
                      <Link
                        href="/donor-lookup"
                        className="block text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors pt-1"
                      >
                        Already donated? Look up your donations &amp; receipts →
                      </Link>
                    </div>

                    {formError && (
                      <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
                        {formError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 ${accent.solid} text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-sm hover:shadow-md active:scale-[0.98]`}
                    >
                      {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          Donate Now
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                ) : googleFormUrl ? (
                  <div className="space-y-5">
                    <button
                      onClick={openForm}
                      className={`w-full py-4 ${accent.solid} text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]`}
                    >
                      Apply Now
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="text-sm font-medium text-secondary mb-1">Applications opening soon</p>
                    <p className="text-xs text-muted-foreground">Check back later or contact us for more information.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function InvolvementDetailClient(props: Props) {
  return (
    <ToastProvider>
      <InvolvementDetailInner {...props} />
    </ToastProvider>
  );
}
