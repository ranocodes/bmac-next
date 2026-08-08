import CreateAdminForm from "@/components/admin/CreateAdminForm";
import { requirePage } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function NewAdminPage() {
  const session = await requirePage("manage_users");

  return <CreateAdminForm email={session.email} />;
}