import { requirePage } from "@/lib/auth/server";
import { getWorkflowDetail } from "@/actions/workflows";
import ApplicationReview from "@/components/admin/ApplicationReview";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePage("manage_workflows");
    const { id } = await params;
    const detail = await getWorkflowDetail(id).catch(() => null);
    if (!detail) notFound();
    return <ApplicationReview detail={detail} />;
  } catch (e) {
    console.error("ApplicationReviewPage error:", e);
    notFound();
  }
}
