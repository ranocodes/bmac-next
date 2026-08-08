import TeamForm from "@/components/admin/TeamForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewTeamPage() {
  await requirePage("manage_team");
  return <TeamForm />;
}
