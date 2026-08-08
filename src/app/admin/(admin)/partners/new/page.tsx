import PartnerForm from "@/components/admin/PartnerForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewPartnerPage() {
  await requirePage("manage_partners");
  return <PartnerForm />;
}
