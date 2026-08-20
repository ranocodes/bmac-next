import { requirePage } from "@/lib/auth/server";
import { getProgramDetail } from "@/actions/programs";
import ProgramAdminDetail from "@/components/admin/ProgramAdminDetail";
import { notFound } from "next/navigation";

export default async function ProgramDetailPage(props: { params: Promise<{ id: string }> }) {
  try {
    await requirePage("manage_programs");
    const { id } = await props.params;
    const data = await getProgramDetail(id);
    if (!data) notFound();
    return <ProgramAdminDetail initialData={data} programId={id} />;
  } catch (e) {
    console.error("ProgramDetailPage error:", e);
    notFound();
  }
}
