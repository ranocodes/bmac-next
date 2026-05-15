"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import FadeIn from "@/components/FadeIn";

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
        <FadeIn className="contact-layout">
          <div className="contact-side">
            <h2>Send Us a Message</h2>
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent!");
              }}
            >
              <div className="form-group">
                <label htmlFor="cname">Full Name</label>
                <input
                  type="text"
                  id="cname"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cemail">Email Address</label>
                <input
                  type="email"
                  id="cemail"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cphone">
                  Phone{" "}
                  <span style={{ fontWeight: 400, color: "var(--muted)" }}>
                    (optional)
                  </span>
                </label>
                <input type="tel" id="cphone" placeholder="+234 ..." />
              </div>
              <div className="form-group">
                <label htmlFor="csubject">Subject</label>
                <select id="csubject">
                  <option>General Inquiry</option>
                  <option>Programs</option>
                  <option>Partnerships</option>
                  <option>Donations</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label htmlFor="cmsg">Message</label>
                <textarea
                  id="cmsg"
                  placeholder="Tell us how we can help..."
                  required
                ></textarea>
              </div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <button
                  className="btn btn-green"
                  type="submit"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Send Message <Send size={18} />
                </button>
              </div>
            </form>
          </div>
          <div className="info-side">
            <h2>Get in Touch</h2>
            <div className="info-card">
              <div className="ic">
                <MapPin size={20} />
              </div>
              <div>
                <h4>Address</h4>
                <p>Nalado Street, Jos, Plateau State, Nigeria</p>
              </div>
            </div>
            <div className="info-card">
              <div className="ic">
                <Phone size={20} />
              </div>
              <div>
                <h4>Phone</h4>
                <p>
                  +234 803 456 7891
                  <br />
                  +234 902 123 4567
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="ic">
                <Mail size={20} />
              </div>
              <div>
                <h4>Email</h4>
                <p>
                  hello@bmacjos.org
                  <br />
                  info@bmacjos.org
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="ic">
                <Clock size={20} />
              </div>
              <div>
                <h4>Office Hours</h4>
                <p>
                  Mon - Fri: 9:00 AM - 5:00 PM
                  <br />
                  Saturday: 10:00 AM - 2:00 PM
                </p>
              </div>
            </div>
            <h4 style={{ marginTop: "24px", marginBottom: "12px" }}>
              Follow Us
            </h4>
            <div className="social-row">
              <a href="#" className="social-btn" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              {/* TikTok placeholder */}
              <a href="#" className="social-btn" aria-label="TikTok">
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  d
                </span>
              </a>
              <a href="#" className="social-btn" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-btn" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
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
