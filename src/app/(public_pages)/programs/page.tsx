import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProgramsClient from "./ProgramsClient";

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Explore BMAC programs in public speaking, literary arts, mentorship and digital literacy for young minds in Jos.',
  alternates: { canonical: "programs" },
};


export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const all = await db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" });
  const programs = (all || []).filter((p: any) => p.status === "published");
  return <ProgramsClient initialPrograms={programs} />;
}
