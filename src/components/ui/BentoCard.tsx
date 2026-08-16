"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  variant?: "default" | "featured" | "mini";
}

export const BentoCard = ({ children, className, onClick, delay = 0, variant = "default" }: BentoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay,
      }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border border-border transition-colors hover:border-primary/40",
        variant === "default" && "p-8",
        className
      )}
    >
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};
