import { db } from "@/lib/db";
import StatsTable from "@/components/admin/StatsTable";

export default async function StatsAdminPage() {
  const items = await db.getAll<any>("impact_stats").catch(() => []);
  return <StatsTable initialData={items} />;
}
