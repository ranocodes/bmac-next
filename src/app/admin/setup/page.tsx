import SetupForm from "@/components/admin/SetupForm";
import { getSuperAdminCount } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const count = await getSuperAdminCount();
  if (count > 0) redirect("/admin/login");

  return <SetupForm />;
}