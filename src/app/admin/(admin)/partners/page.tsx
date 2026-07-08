import { db } from "@/lib/db";
import PartnerTable from "@/components/admin/PartnerTable";

export default async function PartnersPage() {
  const partners = await db.getAll<any>("partners").catch(() => []);
  return <PartnerTable initialData={partners} />;
}
