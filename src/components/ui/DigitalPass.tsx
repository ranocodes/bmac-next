"use client";

import React from "react";
import { BentoCard } from "@/components/ui/BentoCard";
import { cn } from "@/lib/utils";

interface DigitalPassProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "featured" | "mini";
}

export const DigitalPass = ({ children, className, variant = "default" }: DigitalPassProps) => {
  return (
    <BentoCard
      variant={variant}
      className={cn(
        "rounded-xl border border-border shadow-none",
        variant === "mini" && "p-6",
        variant === "featured" && "p-8",
        variant === "default" && "p-8",
        className
      )}
    >
      {children}
    </BentoCard>
  );
};
