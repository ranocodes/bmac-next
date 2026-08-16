"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export const EmptyState = ({
  icon: Icon = Info,
  title,
  description,
  ctaText,
  ctaHref,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center justify-center py-24 px-8 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm"
    >
      <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-muted-foreground mb-8">
        <Icon size={40} strokeWidth={1.2} />
      </div>
      <h3 className="font-display text-2xl font-bold text-deep mb-4 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-400 text-base max-w-sm mb-10 leading-relaxed">
        {description}
      </p>
      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-3 bg-deep text-white px-10 py-4 rounded-full text-sm font-bold hover:bg-green transition-all shadow-xl shadow-emerald-900/10"
        >
          {ctaText} <ArrowRight size={18} />
        </Link>
      )}
    </motion.div>
  );
};
