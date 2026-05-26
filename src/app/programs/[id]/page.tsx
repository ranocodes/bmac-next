import React from "react";
import { getPrograms } from "@/lib/cms";
import ProgramDetailClient from "./ProgramDetailClient";

export const revalidate = 3600;

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programs = await getPrograms();
  const program = programs.find((p) => p.id === id);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Program Not Found</h2>
          <a href="/programs" className="text-primary font-bold">Back to Curriculum</a>
        </div>
      </div>
    );
  }

  const otherPathways = programs.filter(p => p.id !== id).slice(0, 3);

  return (
    <ProgramDetailClient program={program} otherPathways={otherPathways} />
  );
}
