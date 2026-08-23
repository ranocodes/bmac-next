import { notFound } from "next/navigation";
import { getInvolvementPage } from "@/actions/involvement-pages";
import { getGoogleForms } from "@/actions/settings";
import { editorial } from "../editorial-font";
import InvolvementDetailClient from "./InvolvementDetailClient";

export const dynamic = "force-dynamic";

const ENTITY_MAP: Record<string, string> = {
  join: "member",
  volunteer: "volunteer",
  school: "school-chapter",
  partner: "partner",
};

export default async function InvolvementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, googleForms] = await Promise.all([
    getInvolvementPage(id),
    getGoogleForms(),
  ]);
  if (!page) notFound();

  const entityType = ENTITY_MAP[id] || null;

  return (
    <div className={editorial.variable}>
      <InvolvementDetailClient
        page={page}
        slug={id}
        entityType={entityType}
        googleForms={googleForms}
      />
    </div>
  );
}
