import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import ActivityLogTable from "@/components/admin/ActivityLogTable";

export default async function LogsPage() {
  await requirePage("manage_logs");
  const logs = await db.getAll<any>("activity_logs").catch(() => []);
  return <ActivityLogTable initialData={logs} />;
}
