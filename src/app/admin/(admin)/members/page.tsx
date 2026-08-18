import { getMembers } from "@/actions/people";
import { requirePage } from "@/lib/auth/server";
import PeopleTable from "@/components/admin/PeopleTable";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const admin = await requirePage("manage_people");
  const people = await getMembers().catch(() => []);
  return <PeopleTable initialData={people} canExport={admin.permissions.includes("export_data")} />;
}
