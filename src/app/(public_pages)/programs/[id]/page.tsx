import { db } from "@/lib/db";
import ProgramDetailClient from "./ProgramDetailClient";

export const dynamic = "force-dynamic";

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programs = await db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" });
  return <ProgramDetailClient id={id} initialPrograms={programs || []} />;
}
