"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Users,
  HeartHandshake,
  Banknote,
  Handshake,
  School,
  Send,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { BentoCard } from "@/components/ui/BentoCard";

const ways = [
  {
    id: "join",
    title: "Join BMAC",
    desc: "Become a member and access workshops, mentorship, and a vibrant community of young leaders.",
    icon: <Users size={24} />,
    color: "bg-emerald-50 text-emerald-600",
    details: "Open to ages 16-30|Quarterly cohorts|Annual dues: ₦2,000|Access to all programs|Community network|Leadership opportunities",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    desc: "Share your skills as a facilitator, event coordinator, or mentor for our members.",
    icon: <HeartHandshake size={24} />,
    color: "bg-amber-50 text-amber-600",
    details: "Flexible time commitment|No minimum hours|Training provided|Certificate of service|Community impact recognition",
  },
  {
    id: "school",
    title: "School Chapter",
    desc: "Bring the BMAC movement to your school or university to empower your fellow students.",
    icon: <School size={24} />,
    color: "bg-indigo-50 text-indigo-600",
    details: "Student-led leadership|Official BMAC accreditation|Curriculum support|Inter-school networking|Chapter events",
  },
  {
    id: "donate",
    title: "Donate",
    desc: "Support our mission financially to fund workshops and community outreach programs.",
    icon: <Banknote size={24} />,
    color: "bg-rose-50 text-rose-600",
    details: "₦5,000 sponsors one workshop|₦25,000 funds a scholarship|Tax-deductible receipts|Quarterly impact reports",
  },
  {
    id: "partner",
    title: "Partner With Us",
    desc: "Organizations can partner with us to amplify youth empowerment in Plateau State.",
    icon: <Handshake size={24} />,
    color: "bg-blue-50 text-blue-600",
    details: "Custom partnership tiers|Brand visibility at events|Co-branded programs|Impact metrics reporting",
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
    <main suppressHydrationWarning className="bg-background">
      <section className="relative min-h-[50dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card">
        <div className="absolute inset-0 bg-secondary/5" style={{ backgroundImage: 'radial-gradient(var(--secondary) 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              Movement of Minds
            </span>
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
              Empower <span className="text-primary italic font-light serif">The Future</span>.
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* CMS-READY UNIFORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ways.map((way, i) => (
              <BentoCard
                key={way.id}
                delay={i * 0.1}
                className="flex flex-col h-full bg-card border-none shadow-sm hover:shadow-xl transition-all"
                onClick={() => setSelectedWay(way)}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-2xl ${way.color} flex items-center justify-center mb-6`}>
                    {way.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-secondary mb-3 tracking-tight">
                    {way.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">
                    {way.desc}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      Learn More
                    </span>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Modal */}
      <Modal isOpen={!!selectedWay} onClose={() => setSelectedWay(null)}>
        {selectedWay && (
          <div className="bg-card p-8 md:p-12">
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase block mb-2">
                  Action Step
                </span>
                <h2 className="font-display text-4xl font-extrabold text-secondary tracking-tighter leading-none">
                  {selectedWay.title}
                </h2>
              </div>
              <div className={`p-4 rounded-2xl ${selectedWay.color}`}>
                {selectedWay.icon}
              </div>
            </div>

            <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-xl">
              {selectedWay.desc}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <h4 className="font-bold text-secondary uppercase text-[10px] tracking-widest mb-4">What to Expect</h4>
                    <div className="space-y-3">
                      {selectedWay.details.split("|").map((detail: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-xl border border-border/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {detail}
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="bg-secondary rounded-bento p-8 text-secondary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20" />
                
                <h3 className="relative z-10 font-display text-xl font-bold mb-6">
                   {selectedWay.id === "donate" ? "Gift of Growth" : "Get Started"}
                </h3>

                {selectedWay.id === "donate" && (
                  <div className="space-y-6 mb-8 relative z-10">
                    <div className="flex flex-wrap gap-2">
                      {["5000", "10000", "25000", "custom"].map((amt) => (
                        <button
                          key={amt}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            donateAmount === amt 
                              ? "bg-accent border-accent text-accent-foreground" 
                              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                          }`}
                          onClick={() => setDonateAmount(amt)}
                        >
                          {amt === "custom" ? "Custom" : `₦${parseInt(amt).toLocaleString()}`}
                        </button>
                      ))}
                    </div>
                    {donateAmount === "custom" && (
                      <input
                        type="number"
                        placeholder="Enter amount (₦)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    )}
                  </div>
                )}

                <form className="space-y-4 relative z-10" onSubmit={selectedWay.id === "donate" ? handleDonate : (e) => { e.preventDefault(); alert("Success!"); setSelectedWay(null); }}>
                  <input type="text" placeholder="Full Name" className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none" required />
                  <input type="email" placeholder="Email Address" className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none" required />
                  <button className="w-full py-4 bg-accent text-accent-foreground font-bold rounded-xl text-sm hover:bg-card hover:text-accent transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-accent/10">
                    {selectedWay.id === "donate" ? "Complete Donation" : "Join the Movement"} 
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
