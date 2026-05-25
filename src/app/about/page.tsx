import React from "react";
import { getTeam, getImpactStats } from "@/lib/cms";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const team = await getTeam();
  const impact = await getImpactStats();

  return (
    <main suppressHydrationWarning className="bg-background">
      <AboutClient team={team} impact={impact} />
    </main>
  );
}
