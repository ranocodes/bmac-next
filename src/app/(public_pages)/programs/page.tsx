import { db } from "@/lib/db";
import ProgramsClient from "./ProgramsClient";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const all = await db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" });
  const programs = (all || []).filter((p: any) => p.status === "published");
  return <ProgramsClient initialPrograms={programs} />;
}
