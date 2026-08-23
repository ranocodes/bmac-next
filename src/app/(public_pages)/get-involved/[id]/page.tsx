import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInvolvementPage } from "@/actions/involvement-pages";
import { getGoogleForms } from "@/actions/settings";
import { editorial } from "../editorial-font";
import InvolvementDetailClient from "./InvolvementDetailClient";

export const revalidate = 300;

const TITLES: Record<string, string> = {
  join: "Become a Member",
  volunteer: "Volunteer With Us",
  school: "School Chapters",
  partner: "Partner With Us",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: TITLES[id] || "Get Involved",
    alternates: { canonical: `/get-involved/${id}` },
  };
}

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
