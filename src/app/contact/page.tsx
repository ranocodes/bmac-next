"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { ContactCard } from "@/components/ui/contact-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "./actions";

const faqs = [
  {
    q: "How do I join BMAC?",
    a: "Fill out the membership form on our Get Involved page or visit our office on Nalado Street. New cohorts open quarterly, and we welcome applicants aged 16-30 who are passionate about personal development and community impact.",
  },
  {
    q: "What are the membership requirements?",
    a: "We accept anyone between ages 16 and 30 who is committed to growth and community service. No prior experience is needed — just willingness to learn and contribute. Membership dues are minimal and go directly toward program materials.",
  },
  {
    q: "How can I volunteer?",
    a: "We welcome volunteers with skills in facilitation, event planning, writing, digital media, and mentorship. Email hello@bmacjos.org with a brief description of what you can offer and your availability.",
  },
  {
    q: "Are programs free or paid?",
    a: "Most programs are free for BMAC members. Workshops and competitions are open to the public at a small registration fee. We offer scholarships for participants who cannot afford fees — no one is turned away for financial reasons.",
  },
  {
    q: "Can schools partner with BMAC?",
    a: "Absolutely. We actively partner with schools, NGOs, and organizations across Plateau State. Reach out through our contact form or email info@bmacjos.org to discuss collaboration opportunities.",
  },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(sendContactMessage, null);

  return (
    <main suppressHydrationWarning>
      <section className="page-hero">
        <Image
          src="/images/about-hero.jpg"
          alt="Contact us"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-content">
          <h1>CONTACT US</h1>
        </div>
      </section>

      <section className="section">
        <FadeIn>
          <ContactCard
            title="Get in Touch"
            description="If you have any questions regarding our Services or need help, please fill out the form here. We do our best to respond within 1 business day."
            contactInfo={[
              { icon: Mail, label: "Email", value: "hello@bmacjos.org" },
              { icon: Phone, label: "Phone", value: "+234 803 456 7891" },
              { icon: MapPin, label: "Address", value: "Nalado Street, Jos, Plateau State, Nigeria" },
            ]}
          >
            <form action={formAction} className="w-full space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required />
              </div>
              <Button className="w-full" type="submit" disabled={pending}>
                {pending ? "Sending..." : "Submit"}
              </Button>
              {state?.success && (
                <p className="text-sm text-green-600">Message sent successfully!</p>
              )}
              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}
            </form>
          </ContactCard>
        </FadeIn>
      </section>

      <div className="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31226.39734639848!2d8.8721!3d9.9280!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104b42f0c5e0e7e7%3A0x1e2e2e2e2e2e2e2e!2sJos%2C%20Plateau%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1714600000000!5m2!1sen!2sng"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <div className="map-label">
          <MapPin size={18} /> Visit Us at Nalado Street, Jos
        </div>
      </div>

      <section className="faq-section">
        <div className="faq-inner">
          <FadeIn>
            <h2>Frequently Asked Questions</h2>
          </FadeIn>
          {faqs.map((faq, i) => (
            <FadeIn
              key={i}
              delay={i * 0.1}
              className={`faq-item ${openFaq === i ? "open" : ""}`}
            >
              <button
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q} <ChevronDown size={20} />
              </button>
              <div
                className="faq-a"
                style={{ maxHeight: openFaq === i ? "300px" : 0 }}
              >
                <p>{faq.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="cta">
        <FadeIn className="cta-inner">
          <div className="section-eyebrow">Need More Info?</div>
          <h2>Still Have Questions?</h2>
          <button className="btn btn-white-outline">
            Call Us <Phone size={18} />
          </button>
        </FadeIn>
      </section>
    </main>
  );
}
