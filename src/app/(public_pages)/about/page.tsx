import React from "react";
import { mockTeam, mockStats } from "@/data/mock-data";
import AboutClient from "./AboutClient";

export default function AboutPage() {
  return (
    <main suppressHydrationWarning className="bg-background">
      <AboutClient team={mockTeam} impact={mockStats} />
    </main>
  );
}
