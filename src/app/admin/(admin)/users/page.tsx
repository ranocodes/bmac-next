import { getAdminUsers } from "@/actions/admin-users";
import { requirePage } from "@/lib/auth/server";
import UsersTable from "@/components/admin/UsersTable";

export default async function UsersPage() {
  await requirePage("manage_users");
  const users = await getAdminUsers();
  return <UsersTable initialData={users} />;
}
