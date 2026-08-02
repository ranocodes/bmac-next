import { db } from "@/lib/db";
import PaymentsTable from "@/components/admin/PaymentsTable";

export default async function PaymentsPage() {
  const payments = await db.getAll<any>("paystack_payments").catch(() => []);
  return <PaymentsTable initialData={payments} />;
}
