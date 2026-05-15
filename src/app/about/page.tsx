"use client";

import Image from "next/image";
import Link from "next/link";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";

const team = [
  {
    name: "Suleiman Peace Jagaban",
    role: "Founder & Director",
    img: "/images/jagsba.jpg",
  },
  { name: "Amina Bello", role: "Programs Director", img: "/images/jagsba.jpg" },
  {
    name: "Chinedu Okonkwo",
    role: "Head of Communications",
    img: "/images/jagsba.jpg",
  },
  {
    name: "Fatima Abdullahi",
    role: "Mentorship Coordinator",
    img: "/images/jagsba.jpg",
  },
];

const impact = [
  { num: "350+", label: "Members Trained" },
  { num: "48", label: "Events Hosted" },
  { num: "12", label: "Community Partners" },
  { num: "8", label: "Awards Won" },
];

export default function About() {
  return (
    <main suppressHydrationWarning>
      <section className="page-hero">
        <Image
          src="/images/about-hero.jpg"
          alt="BMAC Jos team"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-content">
          <h1>About Us</h1>
        </div>
      </section>

      <section className="story">
        <FadeIn className="story-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            Our Story
          </div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Where It All Began
          </h2>
          <p>
            Brilliant Minds Ambassadors Club (BMAC) was founded in Jos, Plateau
            State by Suleiman Peace Jagaban — a young leader who saw the
            untapped potential in the youth around him. Starting as a small
            weekly gathering focused on building confidence through public
            speaking, BMAC has grown into one of the most active youth
            development organizations in northern Nigeria.
          </p>
          <p>
            What began with five members meeting in a community hall has become
            a movement of over 350 trained young people across Plateau State.
            Our members have gone on to win regional debate championships,
            publish their creative writing, lead school clubs, and launch
            community initiatives that reach thousands.
          </p>
          <p>
            BMAC's long-term vision is to establish a network of youth
            empowerment centers across every major city in northern Nigeria —
            each one serving as a launchpad for young people to discover their
            voice, develop their skills, and lead meaningful change in their
            communities.
          </p>
        </FadeIn>
      </section>

      <section className="programs">
        <div
          className="section-header"
          style={{ maxWidth: "var(--max-w)", margin: "0 auto 48px" }}
        >
          <FadeIn>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Mission, Vision & Values
            </h2>
          </FadeIn>
        </div>
        <div className="mv-grid">
          <FadeIn delay={0.1} className="mv-card">
            <div className="icon-box green">
              <Target size={24} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To identify, train, and empower young people in Jos and beyond
              with the communication, creative, and critical thinking skills
              they need to lead with confidence and impact their communities
              positively.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="mv-card">
            <div className="icon-box gold">
              <Eye size={24} />
            </div>
            <h3>Our Vision</h3>
            <p>
              A generation of young African leaders who speak boldly, think
              critically, create fearlessly, and build communities where every
              voice matters.
            </p>
          </FadeIn>
          <FadeIn delay={0.3} className="mv-card">
            <div className="icon-box green">
              <Heart size={24} />
            </div>
            <h3>Our Values</h3>
            <p>
              Excellence in every session. Inclusivity — no one is turned away
              for inability to pay. Integrity in how we mentor. Impact measured
              by real outcomes, not just attendance numbers.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="story">
        <div className="story-inner" style={{ maxWidth: "var(--max-w)" }}>
          <FadeIn>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Meet Our Team
            </h2>
          </FadeIn>
          <div className="team-grid">
            {team.map((member, i) => (
              <FadeIn key={i} delay={i * 0.1} className="team-card">
                <Image
                  src={member.img}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="team-portrait"
                />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="impact-numbers">
        <FadeIn className="impact-grid">
          {impact.map((stat, i) => (
            <div key={i} className="impact-stat">
              <h3>{stat.num}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </FadeIn>
      </section>

      <section className="cta-banner">
        <FadeIn className="cta-banner-inner">
          <div className="section-eyebrow">Join the Movement</div>
          <h2>Join Our Growing Community</h2>
          <Link href="/get-involved" className="btn btn-outline">
            Learn More <ArrowRight size={18} />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
