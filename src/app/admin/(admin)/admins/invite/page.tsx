import InviteForm from "@/components/admin/InviteForm";
import { getSuperAdminSession } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateInvitePage() {
  const session = await getSuperAdminSession();
  if (!session) redirect("/admin/login");

  return <InviteForm email={session.email} />;
}