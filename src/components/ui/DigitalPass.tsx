"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DigitalPassProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "featured" | "mini";
}

export const DigitalPass = ({ 
  children, 
  className,
  variant = "default" 
}: DigitalPassProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden bg-card border border-border/50 shadow-diffused transition-all duration-500",
        variant === "mini" ? "rounded-2xl" : "rounded-bento",
        className
      )}
    >
      {/* Perforated Ticket Cutouts (Only for non-featured) */}
      {variant !== "featured" && (
        <>
          <div className="absolute top-1/2 -left-2.5 w-5 h-5 bg-background rounded-full -translate-y-1/2 z-10 border-r border-border/20 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]" />
          <div className="absolute top-1/2 -right-2.5 w-5 h-5 bg-background rounded-full -translate-y-1/2 z-10 border-l border-border/20 shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)]" />
        </>
      )}

      {/* Liquid Glass Refraction */}
      <div className={cn(
        "absolute inset-0 z-0 pointer-events-none border-[1px] border-card/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
        variant === "mini" ? "rounded-2xl" : "rounded-bento"
      )} />
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
      
      {/* Background Glow */}
      <div className="absolute -inset-1 z-[-1] bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
    </motion.div>
  );
};
