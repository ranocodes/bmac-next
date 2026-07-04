import { db } from "@/lib/db";
import StatsForm from "@/components/admin/StatsForm";

export default async function EditStatPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("impact_stats", id).catch(() => null);
  return <StatsForm initialData={item} />;
}
