import { getPerson } from "@/actions/people";
import PersonDetail from "@/components/admin/PersonDetail";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await getPerson(id).catch(() => null);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-secondary">Person not found</p>
      </div>
    );
  }

  return <PersonDetail person={data.person} records={data.records} isAdmin={data.isAdmin} />;
}
