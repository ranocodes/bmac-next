import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import TeamForm from "@/components/admin/TeamForm";

export default async function EditTeamPage(props: { params: Promise<{ id: string }> }) {
  await requirePage("manage_team");
  const { id } = await props.params;
  const item = await db.getById<any>("team_members", id).catch(() => null);
  return <TeamForm initialData={item} />;
}
