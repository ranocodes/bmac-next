import { db } from "@/lib/db";
import ActivityLogTable from "@/components/admin/ActivityLogTable";

export default async function LogsPage() {
  const logs = await db.getAll<any>("activity_logs").catch(() => []);
  return <ActivityLogTable initialData={logs} />;
}
