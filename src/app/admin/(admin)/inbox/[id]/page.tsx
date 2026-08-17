import { requirePage } from "@/lib/auth/server";
import { getWorkflowDetail } from "@/actions/workflows";
import ApplicationReview from "@/components/admin/ApplicationReview";

export const dynamic = "force-dynamic";

export default async function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("manage_workflows");
  const { id } = await params;
  const detail = await getWorkflowDetail(id);
  if (!detail) return <div>Not found</div>;
  return <ApplicationReview detail={detail} />;
}
