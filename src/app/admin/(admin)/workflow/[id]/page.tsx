import { notFound } from "next/navigation";
import { requirePage } from "@/lib/auth/server";
import { getWorkflowDetail } from "@/actions/workflows";
import WorkflowDetail from "@/components/admin/WorkflowDetail";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("manage_workflows");
  const { id } = await params;
  const data = await getWorkflowDetail(id);
  if (!data) notFound();
  return <WorkflowDetail record={data.record} person={data.person} answers={data.answers} />;
}
