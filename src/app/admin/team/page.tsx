import { db } from "@/lib/db";
import TeamTable from "@/components/admin/TeamTable";

export default async function TeamPage() {
  const items = await db.getAll<any>("team_members").catch(() => []);
  return <TeamTable initialData={items} />;
}
