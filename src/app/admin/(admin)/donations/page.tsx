import { requirePage } from "@/lib/auth/server";
import { getDonations } from "@/actions/donations";
import DonationsTable from "@/components/admin/DonationsTable";

export default async function DonationsPage() {
  await requirePage("manage_payments");
  const donations = await getDonations();
  return <DonationsTable initialData={donations} />;
}
