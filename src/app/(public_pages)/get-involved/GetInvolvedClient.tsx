"use client";

import {
  Users,
  HeartHandshake,
  Banknote,
  Handshake,
  School,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Way {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  chip: string;
}

const ways: Way[] = [
  {
    id: "join",
    title: "Join BMAC",
    desc: "Become a member and access workshops, mentorship, and a vibrant community of young leaders.",
    icon: Users,
    chip: "bg-[#DCEBDD] text-[#1a4d2e]",
  },
  {
    id: "volunteer",
    title: "Volunteer",
    desc: "Share your skills as a facilitator, event coordinator, or mentor for our members.",
    icon: HeartHandshake,
    chip: "bg-[#FDEBEC] text-[#7f1d1d]",
  },
  {
    id: "school",
    title: "School Chapter",
    desc: "Bring the BMAC movement to your school or university to empower your fellow students.",
    icon: School,
    chip: "bg-[#FBF3DA] text-[#713f12]",
  },
  {
    id: "donate",
    title: "Donate",
    desc: "Support our mission financially to fund workshops and community outreach programs.",
    icon: Banknote,
    chip: "bg-[#E1EFFA] text-[#0c4a6e]",
  },
  {
    id: "partner",
    title: "Partner With Us",
    desc: "Organizations can partner with us to amplify youth empowerment in Plateau State.",
    icon: Handshake,
    chip: "bg-[#EDE9FE] text-[#4c1d95]",
  },
];

export default function GetInvolved() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="px-6 pt-32 md:pt-44 pb-14 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Get Involved
            </span>
            <h1 className="font-editorial mt-6 text-4xl sm:text-5xl md:text-7xl font-medium text-secondary leading-[1.05] tracking-tight">
              Empower the future.
            </h1>
            <p className="mt-6 md:mt-8 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Choose how you want to make a difference. Every path leads to
              impact — for you, and for young minds across Jos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* BENTO GRID — hairline dividers */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border"
          >
            {ways.map((way, i) => (
              <Link
                key={way.id}
                href={`/get-involved/${way.id}`}
                className="group flex flex-col bg-background p-6 md:p-8 min-h-[220px] md:min-h-[260px] hover:bg-muted/50 transition-colors duration-300"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${way.chip}`}
                  >
                    <way.icon size={14} strokeWidth={1.75} />
                  </span>
                </div>

                <h3 className="font-editorial mt-10 md:mt-14 text-xl md:text-2xl font-medium text-secondary tracking-tight">
                  {way.title}
                </h3>
                <p className="mt-3 flex-grow text-sm text-muted-foreground leading-relaxed">
                  {way.desc}
                </p>

                <span className="mt-8 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary group-hover:text-primary transition-colors">
                    Learn more
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
