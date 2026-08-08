import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import ProgramTable from "@/components/admin/ProgramTable";

export default async function ProgramsPage() {
  await requirePage("manage_programs");
  const items = await db.getAll<any>("programs").catch(() => []);
  return <ProgramTable initialData={items} />;
}
