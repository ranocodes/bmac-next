import { getAdminUsers } from "@/actions/admin-users";
import UsersTable from "@/components/admin/UsersTable";

export default async function UsersPage() {
  const users = await getAdminUsers();
  return <UsersTable initialData={users} />;
}
