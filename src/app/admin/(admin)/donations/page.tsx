import { requirePage } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { getDonations } from "@/actions/donations";
import DonationsTabs from "@/components/admin/DonationsTabs";

export default async function DonationsPage() {
  await requirePage("manage_payments");
  const [donations, payments] = await Promise.all([
    getDonations(),
    db.getAll<any>("paystack_payments").catch(() => []),
  ]);
  return <DonationsTabs donations={donations} payments={payments} />;
}
