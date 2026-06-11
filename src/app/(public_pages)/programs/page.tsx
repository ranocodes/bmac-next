import { db } from "@/lib/db";
import ProgramsClient from "./ProgramsClient";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" });
  return <ProgramsClient initialPrograms={programs || []} />;
}
