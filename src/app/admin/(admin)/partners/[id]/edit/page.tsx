import { db } from "@/lib/db";
import PartnerForm from "@/components/admin/PartnerForm";

export default async function EditPartnerPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const partner = await db.getById<any>("partners", id).catch(() => null);
  return <PartnerForm initialData={partner} />;
}
