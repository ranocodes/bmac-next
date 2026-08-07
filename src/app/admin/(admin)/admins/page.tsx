import { getAdminUsers } from "@/actions/admin-users";
import { requirePage } from "@/lib/auth/server";
import AdminsTable from "@/components/admin/AdminsTable";

export default async function AdminsPage() {
  await requirePage("manage_users");
  const users = await getAdminUsers();
  return <AdminsTable initialData={users} />;
}
