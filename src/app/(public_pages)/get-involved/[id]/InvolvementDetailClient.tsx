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

const CHIP_MAP: Record<string, string> = {
  emerald: "bg-[#DCEBDD] text-[#1a4d2e]",
  amber: "bg-[#FBF3DA] text-[#713f12]",
  indigo: "bg-[#EDE9FE] text-[#4c1d95]",
  rose: "bg-[#FDEBEC] text-[#7f1d1d]",
  blue: "bg-[#E1EFFA] text-[#0c4a6e]",
};

const DONATE_AMOUNTS = ["5000", "10000", "25000", "50000", "custom"];

interface Props {
  page: InvolvementPage;
  slug: string;
  entityType: string | null;
  googleForms?: Record<string, string>;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function InvolvementDetailInner({ page, slug, googleForms }: Props) {
  const chip = CHIP_MAP[page.accent_color || "emerald"] || CHIP_MAP.emerald;
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

  const inputClass =
    "w-full px-4 py-3 bg-background border border-border rounded-md text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="px-6 pt-28 md:pt-40 pb-12 md:pb-20 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
            <Link
              href="/get-involved"
              className="group inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Back to Get Involved
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 md:mt-20"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${chip}`}>
                <HeroIcon size={14} strokeWidth={1.75} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Get Involved
              </span>
            </div>
            <h1 className="font-editorial mt-6 text-4xl sm:text-5xl md:text-6xl font-medium text-secondary leading-[1.05] tracking-tight">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
                {page.subtitle}
              </p>
            )}
          </motion.div>

          {page.hero_description && (
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 md:mt-14 max-w-2xl text-sm md:text-base text-secondary/80 leading-relaxed"
            >
              {page.hero_description}
            </motion.p>
          )}
        </div>
      </section>

      {/* SECTIONS — hairline bento */}
      {page.sections.length > 0 && (
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <h2 className="font-editorial text-2xl md:text-4xl font-medium text-secondary tracking-tight leading-tight">
                Everything you need to know
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border"
            >
              {page.sections.map((section: InvolvementSection, i: number) => {
                const SIcon = resolveIcon(section.icon);
                return (
                  <div key={i} className="bg-background p-6 md:p-8 hover:bg-muted/50 transition-colors duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${chip}`}>
                        <SIcon size={14} strokeWidth={1.75} />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums pt-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-editorial mt-6 text-lg md:text-xl font-medium text-secondary tracking-tight">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* BENEFITS — numbered rows */}
      {page.benefits.length > 0 && (
        <section className="px-6 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <h2 className="font-editorial text-2xl md:text-4xl font-medium text-secondary tracking-tight leading-tight">
                At a glance
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-10 md:mt-14 border-t border-border"
            >
              {page.benefits.map((benefit: string, i: number) => (
                <div
                  key={i}
                  className="flex items-baseline gap-5 md:gap-8 border-b border-border py-4 md:py-5"
                >
                  <span className="w-7 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm md:text-base font-medium text-secondary leading-snug">
                    {benefit}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* FORM SECTION */}
      <section className="border-t border-border bg-muted/30 px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* HEADER */}
          <div className="lg:col-span-5">
            <motion.div {...fadeUp} className="lg:sticky lg:top-28">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Ready?
              </span>
              <h2 className="font-editorial mt-4 text-2xl md:text-4xl font-medium text-secondary tracking-tight leading-tight">
                {isDonate ? "Make your donation" : "Submit your application"}
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
                {isDonate
                  ? "Choose an amount below. All donations are tax-deductible and go directly toward empowering young leaders."
                  : "Fill out the form and we'll review your application within 48 hours. We're excited to have you on board."}
              </p>

              {!isDonate && (
                <div className="mt-8 space-y-0 border-t border-border hidden sm:block">
                  {[
                    "Submit your application",
                    "Review within 48 hours",
                    "Welcome to the community",
                  ].map((step, i) => (
                    <div key={i} className="flex items-baseline gap-4 border-b border-border py-3">
                      <span className="w-5 text-xs font-medium text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* FORM CARD */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-background border border-border p-6 md:p-10"
            >
              {submitted ? (
                <div className="text-center py-10">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEBDD] text-[#1a4d2e]"
                  >
                    <CheckCircle2 size={22} strokeWidth={1.75} />
                  </motion.span>
                  <h3 className="font-editorial mt-6 text-2xl font-medium text-secondary tracking-tight">
                    {isDonate ? "Thank you!" : "Application sent"}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {isDonate
                      ? "Your generosity fuels the future. We'll send you a receipt and impact report."
                      : "We've received your application and will get back to you within 48 hours."}
                  </p>
                  <Link
                    href="/get-involved"
                    className="mt-8 inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:bg-primary transition-colors"
                  >
                    <ArrowLeft size={15} />
                    Back to Get Involved
                  </Link>
                </div>
              ) : isDonate ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot */}
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="company_website">Website</label>
                    <input type="text" id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="donor-name" className="block text-sm font-semibold text-secondary">Your Name <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <input
                      id="donor-name"
                      type="text"
                      placeholder="e.g. Amina Yusuf"
                      value={donateName}
                      onChange={(e) => setDonateName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="donor-email" className="block text-sm font-semibold text-secondary">Email Address <span className="font-normal text-muted-foreground">(optional — for receipt)</span></label>
                    <input
                      id="donor-email"
                      type="email"
                      placeholder="you@example.com"
                      value={donateEmail}
                      onChange={(e) => setDonateEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <fieldset className="space-y-3 pt-1">
                    <legend className="text-sm font-semibold text-secondary mb-3">Donation Amount</legend>
                    <div className="flex flex-wrap gap-px bg-border border border-border w-fit max-w-full">
                      {DONATE_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          aria-pressed={donateAmount === amt}
                          className={`px-5 py-2.5 text-xs font-semibold transition-colors ${
                            donateAmount === amt
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-background text-secondary hover:bg-muted/60"
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
                        className={inputClass}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    )}
                    <Link
                      href="/donor-lookup"
                      className="block pt-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      Already donated? Look up your donations &amp; receipts →
                    </Link>
                  </fieldset>

                  {formError && (
                    <div className="px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-md bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground hover:bg-primary transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Redirecting to secure payment...
                      </>
                    ) : (
                      <>
                        Donate Now
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              ) : googleFormUrl ? (
                <button
                  onClick={openForm}
                  className="w-full flex items-center justify-center gap-2.5 rounded-md bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground hover:bg-primary transition-colors cursor-pointer"
                >
                  Apply Now
                  <ExternalLink size={15} />
                </button>
              ) : (
                <div className="border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-semibold text-secondary">Applications opening soon</p>
                  <p className="mt-1 text-xs text-muted-foreground">Check back later or contact us for more information.</p>
                </div>
              )}
            </motion.div>
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
