import { db } from "@/lib/db";
import ProgramTable from "@/components/admin/ProgramTable";

export default async function ProgramsPage() {
  const items = await db.getAll<any>("programs").catch(() => []);
  return <ProgramTable initialData={items} />;
}
