import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import PartnerForm from "@/components/admin/PartnerForm";

export default async function EditPartnerPage(props: { params: Promise<{ id: string }> }) {
  await requirePage("manage_partners");
  const { id } = await props.params;
  const partner = await db.getById<any>("partners", id).catch(() => null);
  return <PartnerForm initialData={partner} />;
}
