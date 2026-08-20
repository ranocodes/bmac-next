import { requirePage } from "@/lib/auth/server";
import { listEmailSequences, getSequenceStats } from "@/actions/email-sequences";
import EmailSequencesAdmin from "@/components/admin/EmailSequencesAdmin";

export const dynamic = "force-dynamic";

export default async function EmailSequencesPage(props: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}) {
  await requirePage("access_settings");
  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const [data, stats] = await Promise.all([
    listEmailSequences({
      status: sp.status as "pending" | "sent" | "failed" | "cancelled" | undefined,
      sequenceType: sp.type as "welcome" | "renewal" | "re-engagement" | undefined,
      limit,
      offset,
    }),
    getSequenceStats(),
  ]);

  return (
    <EmailSequencesAdmin
      sequences={data.rows}
      total={data.total}
      stats={stats}
      currentPage={page}
      limit={limit}
      currentStatus={sp.status}
      currentType={sp.type}
    />
  );
}
