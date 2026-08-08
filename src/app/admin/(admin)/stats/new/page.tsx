import StatsForm from "@/components/admin/StatsForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewStatPage() {
  await requirePage("manage_stats");
  return <StatsForm />;
}
