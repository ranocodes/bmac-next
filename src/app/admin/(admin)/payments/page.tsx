import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import PaymentsTable from "@/components/admin/PaymentsTable";

export default async function PaymentsPage() {
  await requirePage("manage_payments");
  const payments = await db.getAll<any>("paystack_payments").catch(() => []);
  return <PaymentsTable initialData={payments} />;
}
