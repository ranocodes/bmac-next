"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mic, BookOpen, Users, Send } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";

const stats = [
  { num: "350+", label: "Members Trained" },
  { num: "48", label: "Events Hosted" },
  { num: "12", label: "Community Partners" },
  { num: "8", label: "Awards Won" },
];

const programs = [
  {
    title: "Public Speaking Workshops",
    desc: "Structured sessions that take members from nervous beginners to confident speakers capable of commanding any room. Weekly practice, live feedback, real stages.",
    icon: <Mic />,
    color: "green",
    img: "/images/public-speaking.jpg",
    details:
      "Every Saturday, 9am-12pm|BMAC Hall, Nalado Street|Open to all members|Facilitators: Amina Bello, Emeka Okafor",
  },
  {
    title: "Literary & Spoken Word",
    desc: "Creative writing, poetry, and spoken word performance — a space where young voices learn to paint with words.",
    icon: <BookOpen />,
    color: "gold",
    img: "/images/literary-arts.jpg",
    details:
      "Biweekly Wednesdays, 4pm-6pm|Monthly open mic nights|Quarterly showcases|Published anthologies",
  },
  {
    title: "Mentorship",
    desc: "One-on-one pairing with professionals who guide personal growth, career planning, and community leadership.",
    icon: <Users />,
    color: "green",
    img: "/images/mentorship.jpg",
    details:
      "Monthly 1-on-1 sessions|Matched by interest area|Career development focus|6-month minimum commitment",
  },
];

const testimonialData = [
  {
    quote:
      "Before BMAC, I could barely stand in front of five people. Now I moderate panel discussions and speak at school assemblies across Jos. This club changed the trajectory of my life.",
    name: "Ifeoma Nwosu",
    designation: "2025 Cohort Member, Public Speaking Lead",
    src: "/images/unknown.jpg",
  },
  {
    quote:
      "The mentorship program paired me with a professional who helped me navigate my career path in digital arts. BMAC isn't just a club; it's a family that pushes you to be your best.",
    name: "Anu Bello",
    designation: "Creative Arts Lead",
    src: "/images/anu.jpg",
  },
  {
    quote:
      "Joining the Literary and Spoken Word workshops gave me the confidence to share my poetry with the world. I've found my voice and a community that truly understands me.",
    name: "Maryam Sani",
    designation: "Spoken Word Poet",
    src: "/images/maryam.jpg",
  },
];

export default function Home() {
  const [selectedProg, setSelectedProg] = useState<any>(null);

  return (
    <main suppressHydrationWarning>
      {/* Hero Section */}
      <section className="hero">
        <FadeIn className="hero-text">
          <div className="hero-eyebrow">Brilliant Minds Ambassadors Club</div>
          <h1>
            Building <span>Confident</span> Young Leaders in Jos
          </h1>
          <p>
            We equip young people in Plateau State with public speaking,
            literary arts, and digital skills — turning raw potential into
            real-world impact.
          </p>
          <div className="hero-actions">
            <Link href="/get-involved" className="btn btn-green">
              Join BMAC <ArrowRight size={20} />
            </Link>

            <Link href="/programs" className="btn btn-outline">
              View Programs
            </Link>
          </div>
        </FadeIn>
        <div className="hero-image">
          <Image
            src="/images/literary-arts.jpg"
            alt="BMAC members collaborating"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <FadeIn className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat">
              <div className="stat-num">{stat.num}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </FadeIn>
      </section>

      {/* Programs Section */}
      <section className="programs">
        <div className="section-header">
          <FadeIn>
            <div className="section-eyebrow">What We Do</div>
            <h2 className="section-title">Programs That Transform</h2>
          </FadeIn>
        </div>
        <div className="bento">
          {programs.map((prog, i) => (
            <FadeIn
              key={i}
              delay={i * 0.1}
              className="bento-card"
              onClick={() => setSelectedProg(prog)}
            >
              <div className={`icon-box ${prog.color}`}>{prog.icon}</div>
              <h3>{prog.title}</h3>
              <p>{prog.desc}</p>
              <button
                className="link"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProg(prog);
                }}
              >
                Explore Workshop <ArrowRight size={20} />
              </button>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial">
        <div className="section-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <FadeIn>
            <div className="section-eyebrow">Impact Stories</div>
            <h2 className="section-title">Voices of Our Ambassadors</h2>
          </FadeIn>
        </div>
        <FadeIn>
          <CircularTestimonials
            testimonials={testimonialData}
            autoplay={true}
            colors={{
              name: "#0a2e1c",
              designation: "#6b7280",
              testimony: "#111827",
              arrowBackground: "#0f6b3e",
              arrowForeground: "#ffffff",
              arrowHoverBackground: "#d4a843",
            }}
            fontSizes={{
              name: "1.75rem",
              designation: "1rem",
              quote: "1.1rem",
            }}
          />
        </FadeIn>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <FadeIn className="cta-inner">
          <div className="section-eyebrow">Ready?</div>
          <h2>Find Your Voice. Join the Movement.</h2>
          <p>
            The next cohort starts March 2026. Applications are open now for
            young people ages 16-30 across Plateau State.
          </p>
          <div className="cta-actions">
            <Link href="/get-involved" className="btn btn-gold">
              Apply Now <ArrowRight size={18} />
            </Link>
            <Link href="/about" className="btn btn-white-outline">
              Learn More
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Program Modal */}
      <Modal isOpen={!!selectedProg} onClose={() => setSelectedProg(null)}>
        {selectedProg && (
          <>
            <Image
              src={selectedProg.img}
              alt={selectedProg.title}
              width={600}
              height={300}
              className="modal-img"
            />
            <div className="modal-body">
              <div className="section-eyebrow">Program Details</div>
              <h2>{selectedProg.title}</h2>
              <p>{selectedProg.desc}</p>
              <ul className="modal-details">
                {selectedProg.details
                  .split("|")
                  .map((detail: string, i: number) => (
                    <li key={i}>{detail}</li>
                  ))}
              </ul>
              <div className="modal-form">
                <h3>Register for this Program</h3>
                <form
                  className="form-grid"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Registered!");
                    setSelectedProg(null);
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
                    <input type="tel" placeholder="+234 ..." />
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
                      Register Now <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </Modal>
    </main>
  );
}
