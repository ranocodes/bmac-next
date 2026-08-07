import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import StatsForm from "@/components/admin/StatsForm";

export default async function EditStatPage(props: { params: Promise<{ id: string }> }) {
  await requirePage("manage_stats");
  const { id } = await props.params;
  const item = await db.getById<any>("impact_stats", id).catch(() => null);
  return <StatsForm initialData={item} />;
}
