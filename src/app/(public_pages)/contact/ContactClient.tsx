"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import { sendContactMessage } from "./actions";

const faqs = [
  {
    q: "How do I join BMAC?",
    a: "Fill out the membership form on our Get Involved page or visit our hub. New cohorts open quarterly.",
  },
  {
    q: "What are the membership requirements?",
    a: "We accept anyone between ages 16 and 30 who is committed to growth and community service. No prior experience needed.",
  },
  {
    q: "How can I volunteer?",
    a: "We welcome volunteers with skills in facilitation, event planning, and mentoring. Reach out through the form or WhatsApp.",
  },
  {
    q: "Can schools partner with BMAC?",
    a: "Yes. We actively partner with schools and organizations across Plateau State. Select Partnership in the form to start.",
  },
];

interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  hours?: string;
}

export default function Contact({ contactInfo }: { contactInfo?: ContactInfo }) {
  const info = {
    email: contactInfo?.email || "hello@bmacjos.org",
    phone: contactInfo?.phone || "+234 803 456 7891",
    whatsapp: contactInfo?.whatsapp || "2348034567891",
    address: contactInfo?.address || "Nalado Street, Jos",
    hours: contactInfo?.hours || "Mon - Sat: 9am - 5pm",
  };
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [state, formAction, pending] = useActionState(sendContactMessage, null);

  const mapQuery = encodeURIComponent(`${info.address}, Jos, Plateau State, Nigeria`);

  const channels = [
    { label: "Email", value: info.email, href: `mailto:${info.email}` },
    { label: "Phone / WhatsApp", value: info.phone, href: `https://wa.me/${info.whatsapp}` },
    { label: "Visit the hub", value: info.address, href: "" },
    { label: "Opening hours", value: info.hours, href: "" },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="px-6 pt-32 md:pt-44 pb-14 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Contact
            </span>
            <h1 className="font-editorial mt-6 text-4xl sm:text-5xl md:text-7xl font-medium text-secondary leading-[1.05] tracking-tight">
              Start a conversation.
            </h1>
            <p className="mt-6 md:mt-8 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Questions about membership, partnerships, or an event — write to
              us and we will reply within one working day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FORM + CHANNELS */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-px bg-border border border-border">
          {/* Form cell */}
          <div className="lg:col-span-3 bg-background p-6 md:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">01</span>
            <h2 className="font-editorial mt-4 text-2xl md:text-3xl font-medium text-secondary tracking-tight">
              Send a message
            </h2>

            {state?.success && (
              <div className="mt-6 rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                Message sent — we&apos;ll get back to you within 24 hours.
              </div>
            )}
            {state?.error && (
              <div className="mt-6 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
                {state.error}
              </div>
            )}

            <form action={formAction} className="mt-8 space-y-7">
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <div className="space-y-2 group">
                  <label htmlFor="contact-name" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground group-focus-within:text-primary transition-colors">
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="Peace Dagul"
                    disabled={pending}
                    required
                    className="w-full h-11 bg-transparent border-b border-border text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2 group">
                  <label htmlFor="contact-email" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground group-focus-within:text-primary transition-colors">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.org"
                    disabled={pending}
                    required
                    className="w-full h-11 bg-transparent border-b border-border text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="contact-subject" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground group-focus-within:text-primary transition-colors">
                  Subject
                </label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    name="subject"
                    disabled={pending}
                    className="w-full h-11 appearance-none cursor-pointer bg-transparent border-b border-border text-sm text-secondary focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                  >
                    <option>General Inquiry</option>
                    <option>Membership</option>
                    <option>Partnership</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="contact-message" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground group-focus-within:text-primary transition-colors">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  placeholder="How can we help?"
                  disabled={pending}
                  required
                  className="w-full bg-transparent border-b border-border text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none py-2 disabled:opacity-60"
                />
              </div>

              <ConsentCheckbox consentId="contact" />

              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-secondary px-8 text-sm font-semibold text-background transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send message"}
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Channels cell */}
          <div className="lg:col-span-2 bg-background p-6 md:p-10 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">02</span>
            <h2 className="font-editorial mt-4 text-2xl md:text-3xl font-medium text-secondary tracking-tight">
              Direct lines
            </h2>

            <div className="mt-8 divide-y divide-border">
              {channels.map((c) => (
                <div key={c.label} className="py-4 first:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{c.label}</p>
                  {c.href ? (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link mt-1 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                    >
                      {c.value}
                      <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:translate-y-0" />
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-secondary">{c.value}</p>
                  )}
                </div>
              ))}
            </div>

            <Link
              href="/get-involved"
              className="mt-auto pt-8 inline-flex items-center justify-between border-t border-border text-xs font-semibold uppercase tracking-[0.15em] text-secondary hover:text-primary transition-colors group"
            >
              Or get involved
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* MAP */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mt-14 md:mt-20"
        >
          <div className="flex items-end justify-between mb-5">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Find us</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-secondary hover:text-primary transition-colors"
            >
              Open in Maps
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          </div>
          <div className="border border-border overflow-hidden rounded-lg">
            <iframe
              title={`Map of ${info.address}, Jos`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="380"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block w-full grayscale-[35%] contrast-[1.02]"
            />
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">03</span>
          <h2 className="font-editorial mt-4 mb-10 md:mb-14 text-2xl md:text-4xl font-medium text-secondary tracking-tight">
            Common questions
          </h2>

          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border first:border-t">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between gap-6 py-5 md:py-6 text-left group"
                >
                  <span className="font-editorial text-lg md:text-xl font-medium text-secondary group-hover:text-primary transition-colors">
                    {faq.q}
                  </span>
                  <Plus
                    size={16}
                    className={`shrink-0 text-muted-foreground transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 max-w-2xl text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
