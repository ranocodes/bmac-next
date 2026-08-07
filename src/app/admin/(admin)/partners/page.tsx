import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import PartnerTable from "@/components/admin/PartnerTable";

export default async function PartnersPage() {
  await requirePage("manage_partners");
  const partners = await db.getAll<any>("partners").catch(() => []);
  return <PartnerTable initialData={partners} />;
}
