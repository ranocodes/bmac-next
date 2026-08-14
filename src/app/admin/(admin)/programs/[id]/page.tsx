import { requirePage } from "@/lib/auth/server";
import { getProgramDetail } from "@/actions/programs";
import ProgramAdminDetail from "@/components/admin/ProgramAdminDetail";
import { notFound } from "next/navigation";

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  await requirePage("manage_programs");
  const data = await getProgramDetail(params.id);
  if (!data) notFound();
  return <ProgramAdminDetail initialData={data} programId={params.id} />;
}
