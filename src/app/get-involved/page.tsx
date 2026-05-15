"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Users,
  HeartHandshake,
  Banknote,
  Handshake,
  X,
  Send,
} from "lucide-react";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";

const ways = [
  {
    id: "join",
    title: "Join BMAC",
    desc: "Become a member and access workshops, mentorship, competitions, and a vibrant community of young leaders across Plateau State.",
    icon: <Users size={24} />,
    color: "green",
    btnText: "Apply Now",
    details:
      "Open to ages 16-30|Quarterly cohorts|Annual dues: ₦2,000|Access to all programs|Community network|Leadership opportunities",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    desc: "Share your skills and time. We need facilitators, event coordinators, and mentors who want to shape the next generation.",
    icon: <HeartHandshake size={24} />,
    color: "gold",
    btnText: "Volunteer",
    details:
      "Flexible time commitment|No minimum hours|Training provided|Certificate of service|Community impact recognition|Team collaboration",
  },
  {
    id: "donate",
    title: "Donate",
    desc: "Your financial support funds workshops, materials, and outreach programs across Jos. Every contribution counts.",
    icon: <Banknote size={24} />,
    color: "green",
    btnText: "Donate Now",
    details:
      "₦5,000 sponsors one workshop|₦25,000 funds a full scholarship|Tax-deductible receipts|Quarterly impact reports|Named sponsor recognition",
  },
  {
    id: "partner",
    title: "Partner With Us",
    desc: "Organizations, schools, and businesses can partner with BMAC to amplify youth empowerment across Plateau State and beyond.",
    icon: <Handshake size={24} />,
    color: "gold",
    btnText: "Contact Us",
    details:
      "Custom partnership tiers|Brand visibility at events|Co-branded programs|Impact metrics reporting|Annual partnership review",
  },
];

export default function GetInvolved() {
  const [selectedWay, setSelectedWay] = useState<any>(null);
  const [donateAmount, setDonateAmount] = useState("10000");
  const [customAmount, setCustomAmount] = useState("");

  const handleDonate = (e: any) => {
    e.preventDefault();
    const finalAmount = donateAmount === "custom" ? customAmount : donateAmount;
    alert(`Initiating Paystack payment for ₦${finalAmount}`);
    setSelectedWay(null);
  };

  return (
    <main suppressHydrationWarning>
      <section className="page-hero">
        <Image
          src="/images/programs-hero.jpg"
          alt="Get involved"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-content">
          <h1>GET INVOLVED</h1>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <FadeIn className="section-eyebrow">Ways to Participate</FadeIn>
          <FadeIn className="section-title">
            Make an Impact with BMAC Jos
          </FadeIn>
          <FadeIn
            className="form-desc"
            style={{ maxWidth: "600px", marginBottom: "48px" }}
          >
            Whether you want to grow your own skills, share your expertise with
            others, or support our mission financially, there is a place for you
            here.
          </FadeIn>

          <div className="ways-grid">
            {ways.map((way, i) => (
              <FadeIn
                key={i}
                delay={i * 0.1}
                className="way-card"
                onClick={() => setSelectedWay(way)}
              >
                <div className={`icon-box ${way.color}`}>{way.icon}</div>
                <h3>{way.title}</h3>
                <p>{way.desc}</p>
                <button
                  className={`btn ${way.color === "green" ? "btn-green" : "btn-outline"}`}
                >
                  {way.btnText}
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Way Modal */}
      <Modal isOpen={!!selectedWay} onClose={() => setSelectedWay(null)}>
        {selectedWay && (
          <div className="modal-body">
            <div className="section-eyebrow">Get Involved</div>
            <h2>{selectedWay.title}</h2>
            <p>{selectedWay.desc}</p>
            <ul className="modal-details">
              {selectedWay.details
                .split("|")
                .map((detail: string, i: number) => (
                  <li key={i}>{detail}</li>
                ))}
            </ul>

            {selectedWay.id === "donate" && (
              <div className="donate-section">
                <h3>Select Amount</h3>
                <div className="donate-presets">
                  {["5000", "10000", "25000", "custom"].map((amt) => (
                    <button
                      key={amt}
                      className={`donate-btn ${donateAmount === amt ? "active" : ""}`}
                      onClick={() => setDonateAmount(amt)}
                    >
                      {amt === "custom"
                        ? "Custom"
                        : `₦${parseInt(amt).toLocaleString()}`}
                    </button>
                  ))}
                </div>
                {donateAmount === "custom" && (
                  <div
                    className="custom-amount"
                    style={{ display: "block", marginTop: "16px" }}
                  >
                    <div className="form-group">
                      <label>Enter Amount (₦)</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        min="500"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-form">
              <h3>
                {selectedWay.id === "donate"
                  ? "Complete Your Donation"
                  : "Get Started"}
              </h3>
              <form
                className="form-grid"
                onSubmit={
                  selectedWay.id === "donate"
                    ? handleDonate
                    : (e) => {
                        e.preventDefault();
                        alert("Submitted!");
                        setSelectedWay(null);
                      }
                }
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
                    {selectedWay.id === "donate" ? "Donate Now" : "Submit"}{" "}
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
