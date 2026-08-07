import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import TeamTable from "@/components/admin/TeamTable";

export default async function TeamPage() {
  await requirePage("manage_team");
  const items = await db.getAll<any>("team_members").catch(() => []);
  return <TeamTable initialData={items} />;
}
