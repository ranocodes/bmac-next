import { db } from "@/lib/db";
import TeamForm from "@/components/admin/TeamForm";

export default async function EditTeamPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("team_members", id).catch(() => null);
  return <TeamForm initialData={item} />;
}
