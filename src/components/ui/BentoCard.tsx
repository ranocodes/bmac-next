"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export const BentoCard = ({ children, className, onClick, delay = 0 }: BentoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20 
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] bg-white p-8 border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-pointer",
        className
      )}
    >
      {/* Liquid Glass Refraction Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none border-[1px] border-white/20 rounded-[2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
      
      {/* Background Glow on Hover */}
      <div className="absolute -inset-1 z-[-1] bg-gradient-to-br from-green-500/5 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
    </motion.div>
  );
};
