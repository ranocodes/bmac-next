"use client";

import React from "react";
import {
  Users,
  HeartHandshake,
  Banknote,
  Handshake,
  School,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BentoCard } from "@/components/ui/BentoCard";

interface Way {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactElement<{ size?: number | string }>;
  color: string;
}

const ways: Way[] = [
  {
    id: "join",
    title: "Join BMAC",
    desc: "Become a member and access workshops, mentorship, and a vibrant community of young leaders.",
    icon: <Users size={24} />,
    color: "bg-secondary text-background",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    desc: "Share your skills as a facilitator, event coordinator, or mentor for our members.",
    icon: <HeartHandshake size={24} />,
    color: "bg-secondary text-background",
  },
  {
    id: "school",
    title: "School Chapter",
    desc: "Bring the BMAC movement to your school or university to empower your fellow students.",
    icon: <School size={24} />,
    color: "bg-secondary text-background",
  },
  {
    id: "donate",
    title: "Donate",
    desc: "Support our mission financially to fund workshops and community outreach programs.",
    icon: <Banknote size={24} />,
    color: "bg-secondary text-background",
  },
  {
    id: "partner",
    title: "Partner With Us",
    desc: "Organizations can partner with us to amplify youth empowerment in Plateau State.",
    icon: <Handshake size={24} />,
    color: "bg-secondary text-background",
  },
];

const entityTypeMap: Record<string, string> = {
  join: "member",
  volunteer: "volunteer",
  school: "school-chapter",
  partner: "partner",
};

export default function GetInvolved() {
  const visibleWays = ways;

  return (
    <main className="bg-background">
      <section className="pt-20 md:pt-32 pb-8 md:pb-16 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 w-full text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">
              Movement of Minds
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-secondary tracking-tight leading-tight">
              Empower <span className="text-primary/90">The Future</span>.
            </h1>
            <p className="mt-4 md:mt-6 text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              Choose how you want to make a difference. Every path leads to impact.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWays.map((way, i) => (
              <Link key={way.id} href={`/get-involved/${way.id}`} className="block group">
                <BentoCard
                  delay={i * 0.1}
                  className="flex flex-col h-full bg-background border border-border/60 rounded-none hover:border-secondary transition-colors duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500" />
                  
                  <div className="flex flex-col h-full p-5 sm:p-6 md:p-8 relative z-10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-none ${way.color} flex items-center justify-center mb-6 md:mb-8 group-hover:scale-95 transition-transform duration-300 shadow-sm`}>
                      {React.cloneElement(way.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 md:w-6 md:h-6" })}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-2 md:mb-3 tracking-tight">
                      {way.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-10 flex-grow pr-4">
                      {way.desc}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40">
                      <span className="text-xs font-bold uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                        Learn More
                      </span>
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-secondary group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:translate-x-2">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </BentoCard>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
