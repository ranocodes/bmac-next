"use client";

import React, { useEffect, useState } from "react";
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
import { getFormDefinition } from "@/actions/forms";

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
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    desc: "Share your skills as a facilitator, event coordinator, or mentor for our members.",
    icon: <HeartHandshake size={24} />,
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: "school",
    title: "School Chapter",
    desc: "Bring the BMAC movement to your school or university to empower your fellow students.",
    icon: <School size={24} />,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "donate",
    title: "Donate",
    desc: "Support our mission financially to fund workshops and community outreach programs.",
    icon: <Banknote size={24} />,
    color: "bg-rose-50 text-rose-600",
  },
  {
    id: "partner",
    title: "Partner With Us",
    desc: "Organizations can partner with us to amplify youth empowerment in Plateau State.",
    icon: <Handshake size={24} />,
    color: "bg-blue-50 text-blue-600",
  },
];

const entityTypeMap: Record<string, string> = {
  join: "membership",
  volunteer: "volunteer",
  school: "school-chapter",
  partner: "partner",
};

export default function GetInvolved() {
  const [formDefs, setFormDefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    for (const way of ways) {
      const entityType = entityTypeMap[way.id];
      if (entityType && !(way.id in formDefs)) {
        getFormDefinition(entityType).then(def => {
          setFormDefs(prev => ({ ...prev, [way.id]: !!def }));
        });
      }
    }
  }, []);

  const visibleWays = ways.filter(way => {
    const entityType = entityTypeMap[way.id];
    if (!entityType) return true;
    if (!(way.id in formDefs)) return true;
    return formDefs[way.id];
  });

  return (
    <main className="bg-background">
      <section className="pt-24 md:pt-32 pb-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-6 w-full text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">
              Movement of Minds
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight">
              Empower <span className="text-primary">The Future</span>.
            </h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
              Choose how you want to make a difference. Every path leads to impact.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWays.map((way, i) => (
              <Link key={way.id} href={`/get-involved/${way.id}`} className="block">
                <BentoCard
                  delay={i * 0.1}
                  className="flex flex-col h-full bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className="flex flex-col h-full p-1">
                    <div className={`w-12 h-12 rounded-xl ${way.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {way.icon}
                    </div>
                    <h3 className="font-display text-xl font-bold text-secondary mb-3 tracking-tight">
                      {way.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">
                      {way.desc}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Learn More
                      </span>
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-card transition-all duration-300 group-hover:translate-x-1">
                        <ArrowRight size={16} />
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
