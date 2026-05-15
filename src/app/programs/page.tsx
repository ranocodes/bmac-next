"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";

const programs = [
  {
    title: "Public Speaking Workshops",
    desc: "Build confidence and master the art of compelling delivery through structured workshops and live practice sessions.",
    img: "/images/public-speaking.jpg",
    details:
      "Every Saturday, 9am-12pm|BMAC Hall, Nalado Street|Open to all members|Facilitators: Amina Bello, Emeka Okafor|Impromptu + prepared formats",
  },
  {
    title: "Literary & Spoken Word",
    desc: "Explore creative writing, poetry, and spoken word performance in a space that celebrates artistic expression.",
    img: "/images/literary-arts.jpg",
    details:
      "Biweekly Wednesdays, 4pm-6pm|Monthly open mic nights|Quarterly showcases|Published anthologies|Poetry, prose, and performance",
  },
  {
    title: "Mentorship Program",
    desc: "Connect with experienced professionals who guide your personal and career development through one-on-one relationships.",
    img: "/images/mentorship.jpg",
    details:
      "Monthly 1-on-1 sessions|Matched by interest area|Career development focus|6-month minimum commitment|Alumni and industry professionals",
  },
  {
    title: "Competitions",
    desc: "Test your skills in debates, writing contests, and academic competitions that challenge you and showcase your talents.",
    img: "/images/digital-literacy.jpg",
    details:
      "Inter-school debate championships|Creative writing contests|Quarterly tournaments|Travel opportunities|Trophies and certificates",
  },
  {
    title: "Digital Literacy & Critical Thinking",
    desc: "Develop essential digital skills and analytical thinking abilities needed to thrive in today's information-driven world.",
    img: "/images/gallery-hero.jpg",
    details:
      "Six-week curriculum|Research and productivity tools|Online safety training|Partnered with Jos Tech Hub|Certificate on completion",
  },
];

export default function Programs() {
  const [selectedProg, setSelectedProg] = useState<any>(null);

  return (
    <main suppressHydrationWarning>
      <section className="page-hero">
        <Image
          src="/images/programs-hero.jpg"
          alt="BMAC Jos programs"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-content">
          <h1>Our Programs</h1>
        </div>
      </section>

      <section className="story">
        <FadeIn className="story-inner" style={{ textAlign: "center" }}>
          <div className="section-eyebrow">What We Offer</div>
          <h2 className="section-title">Programs Designed to Transform</h2>
          <p>
            Every BMAC program is built around one belief: that young people in
            Jos have extraordinary potential waiting to be unlocked. Our
            curriculum is practical, community-rooted, and designed for
            real-world impact.
          </p>
        </FadeIn>
      </section>

      <section className="programs" style={{ background: "var(--bg)" }}>
        <div className="prog-grid">
          {programs.map((prog, i) => (
            <FadeIn
              key={i}
              delay={i * 0.1}
              className="prog-card"
              onClick={() => setSelectedProg(prog)}
            >
              <Image
                src={prog.img}
                alt={prog.title}
                width={500}
                height={350}
                style={{ objectFit: "cover", width: "100%", height: "220px" }}
              />
              <div className="info">
                <h3>{prog.title}</h3>
                <p>{prog.desc}</p>
                <button
                  className="link"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedProg(prog);
                  }}
                >
                  Learn More <ArrowRight size={20} />
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
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

      <section className="cta">
        <FadeIn className="cta-inner">
          <div className="section-eyebrow">Take the First Step</div>
          <h2>Ready to Start Your Journey?</h2>
          <Link href="/get-involved" className="btn btn-gold">
            Apply Now <ArrowRight size={18} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
