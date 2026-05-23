import React from "react";
import { getPrograms } from "@/lib/cms";
import ProgramsClient from "./ProgramsClient";

// Force dynamic to ensure data is always fresh if we move to real CMS later
export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <main suppressHydrationWarning className="bg-background">
      <ProgramsClient programs={programs} />
    </main>
  );
}
