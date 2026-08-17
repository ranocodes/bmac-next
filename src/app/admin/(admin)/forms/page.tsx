import { requirePage } from "@/lib/auth/server";
import FormsManager from "@/components/admin/FormsManager";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  await requirePage("access_settings");
  return <FormsManager />;
}
