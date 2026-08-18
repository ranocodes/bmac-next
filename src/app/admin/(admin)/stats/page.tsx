import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import dynamic from "next/dynamic";

const StatsTable = dynamic(() => import("@/components/admin/StatsTable"), { ssr: false });

export default async function StatsAdminPage() {
  await requirePage("manage_stats");
  const items = await db.getAll<any>("impact_stats").catch(() => []);
  return <StatsTable initialData={items} />;
}
