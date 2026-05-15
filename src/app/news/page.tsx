"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";

const news = [
  {
    date: "January 28, 2026",
    title: "Annual Spoken Word Night Draws Record Crowd",
    desc: "Over 200 people attended our third annual open mic, with 18 members performing original poetry and spoken word pieces.",
    img: "/images/jj.jpg",
  },
  {
    date: "January 10, 2026",
    title: "New Digital Literacy Program Launches in September",
    desc: "Partnering with Jos Tech Hub, we are introducing a six-week digital skills curriculum covering research, productivity tools, and online safety.",
    img: "/images/digital-literacy.jpg",
  },
  {
    date: "December 18, 2025",
    title: "Meet Our 2026 Cohort of Emerging Leaders",
    desc: "72 new members joined BMAC this quarter — the largest intake in our history, representing 14 schools across Plateau State.",
    img: "/images/IMG_1351.jpg",
  },
  {
    date: "November 5, 2025",
    title: "BMAC Partners with Jos Tech Hub for Youth Training",
    desc: "A landmark partnership that will provide free digital literacy workshops for 120 BMAC members over the next year.",
    img: "/images/cp1.jpg",
  },
  {
    date: "October 22, 2025",
    title: "From Shy to Speaker: Amina's Transformation Story",
    desc: "Amina Danjuma couldn't introduce herself without stuttering in January. By October, she was hosting our monthly open mic.",
    img: "/images/maryam1.jpg",
  },
  {
    date: "September 8, 2025",
    title: "Community Outreach: BMAC Takes Mentorship to Rural Schools",
    desc: "Our team visited four rural schools in Barkin Ladi, conducting speaking workshops for over 150 students.",
    img: "/images/pre.jpg",
  },
];

const events = [
  {
    date: "March 15, 2026",
    title: "Public Speaking Workshop",
    venue: "BMAC Hall, Nalado Street",
  },
  {
    date: "April 2, 2026",
    title: "Inter-School Debate Competition",
    venue: "Hillside Hotel, Jos",
  },
  {
    date: "April 20, 2026",
    title: "Spoken Word Showcase",
    venue: "Jos Museum Auditorium",
  },
  {
    date: "May 8, 2026",
    title: "Mentorship Orientation",
    venue: "BMAC Hall, Nalado Street",
  },
];

export default function News() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <main suppressHydrationWarning>
      <section className="page-hero">
        <Image
          src="/images/about-hero.jpg"
          alt="News and events"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-content">
          <h1>NEWS & EVENTS</h1>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <FadeIn className="section-eyebrow">Featured Story</FadeIn>
          <FadeIn className="featured-card">
            <div style={{ position: "relative", height: "300px" }}>
              <Image
                src="/images/cp.jpg"
                alt="Debate championship"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="featured-info">
              <div className="date">February 14, 2026</div>
              <h2>BMAC Jos Members Sweep Regional Debate Championships</h2>
              <p>
                Five of our members competed in the North-Central Inter-School
                Debate Championship held in Abuja, bringing home three
                first-place trophies and two runner-up medals. The team, coached
                by Amina Bello, impressed judges with arguments on digital
                literacy policy and youth civic engagement.
              </p>
              <Link href="#" className="link">
                Read Full Story <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="news-layout">
            <div className="news-grid">
              {news.map((item, i) => (
                <FadeIn key={i} delay={i * 0.1} className="news-card">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={400}
                    height={200}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "200px",
                    }}
                  />
                  <div className="info">
                    <div className="date">{item.date}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <Link href="#" className="link">
                      Read More <ArrowRight size={12} />
                    </Link>
                  </div>
                </FadeIn>
              ))}
            </div>
            <FadeIn className="event-sidebar" delay={0.3}>
              <h3>Upcoming Events</h3>
              {events.map((event, i) => (
                <div key={i} className="event-item">
                  <div className="date">{event.date}</div>
                  <h4>{event.title}</h4>
                  <p>{event.venue}</p>
                  <button
                    className="btn btn-green"
                    onClick={() => setSelectedEvent(event)}
                  >
                    Register
                  </button>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Event Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="modal-body">
            <div className="section-eyebrow">Event Registration</div>
            <h2>{selectedEvent.title}</h2>
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--green)",
                  marginBottom: "4px",
                }}
              >
                {selectedEvent.date}
              </p>
              <p style={{ color: "var(--muted)" }}>{selectedEvent.venue}</p>
            </div>
            <div
              className="modal-form"
              style={{ borderTop: "none", paddingTop: 0 }}
            >
              <h3>Register for this Event</h3>
              <form
                className="form-grid"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Registered!");
                  setSelectedEvent(null);
                }}
              >
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+234 ..." required />
                </div>
                <div className="form-group">
                  <label>School / Organization</label>
                  <input
                    type="text"
                    placeholder="Where do you study or work?"
                  />
                </div>
                <div className="form-group">
                  <button className="btn btn-green" type="submit">
                    Register <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>

      <section className="newsletter">
        <FadeIn className="newsletter-inner">
          <div className="section-eyebrow">Stay Updated</div>
          <h2 className="section-title" style={{ fontSize: "28px" }}>
            Get BMAC News in Your Inbox
          </h2>
          <p>
            Monthly updates on programs, events, member stories, and
            opportunities.
          </p>
          <form
            className="nl-form"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed!");
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
            />
            <button className="btn btn-green" type="submit">
              Subscribe <Send size={18} />
            </button>
          </form>
        </FadeIn>
      </section>
    </main>
  );
}
