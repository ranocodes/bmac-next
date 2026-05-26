import React from "react";
import { getPrograms, getImpactStats, getTestimonials } from "@/lib/cms";
import HomeClient from "./HomeClient";

// Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const [programs, stats, testimonials] = await Promise.all([
    getPrograms(),
    getImpactStats(),
    getTestimonials(),
  ]);

  return (
    <main suppressHydrationWarning className="bg-background">
      <HomeClient 
        programs={programs} 
        stats={stats} 
        testimonials={testimonials} 
      />
    </main>
  );
}
