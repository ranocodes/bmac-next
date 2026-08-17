import { notFound } from "next/navigation";
import { getInvolvementPage } from "@/actions/involvement-pages";
import InvolvementDetailClient from "./InvolvementDetailClient";

export const dynamic = "force-dynamic";

const ENTITY_MAP: Record<string, string> = {
  join: "membership",
  volunteer: "volunteer",
  school: "school-chapter",
  partner: "partner",
};

export default async function InvolvementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getInvolvementPage(id);
  if (!page) notFound();

  const entityType = ENTITY_MAP[id] || null;

  return (
    <InvolvementDetailClient
      page={page}
      slug={id}
      entityType={entityType}
    />
  );
}
