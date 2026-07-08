import { getAdminUsers } from "@/actions/admin-users";
import AdminsTable from "@/components/admin/AdminsTable";

export default async function AdminsPage() {
  const users = await getAdminUsers();
  return <AdminsTable initialData={users} />;
}
