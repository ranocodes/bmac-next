import InvitesTable from "@/components/admin/InvitesTable";
import { getInvites } from "@/actions/admin-users";
import { getSuperAdminSession } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const session = await getSuperAdminSession();
  if (!session) redirect("/admin/login");
  if (!session.permissions.includes("manage_users")) redirect("/admin");

  const invites = await getInvites();

  return <InvitesTable initialData={invites} />;
}
