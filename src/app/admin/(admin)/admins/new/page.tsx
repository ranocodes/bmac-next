import CreateAdminForm from "@/components/admin/CreateAdminForm";
import { getSuperAdminSession } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewAdminPage() {
  const session = await getSuperAdminSession();
  if (!session) redirect("/admin/login");

  return <CreateAdminForm email={session.email} />;
}