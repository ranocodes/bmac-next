import SetupForm from "@/components/admin/SetupForm";
import * as authClient from "@/lib/auth/client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const count = await authClient.getAdminsCount();
  if (count > 0) redirect("/admin/login");

  return <SetupForm />;
}