import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "@/components/ui/Markdown";
import ProgramDetailClient from "./ProgramDetailClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const baseUrl = SITE_URL;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const all = await db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" });
  const programs = (all || []).filter((p: any) => p.status === "published");
  const program = programs.find((p: any) => p.id === id);
  if (!program) return {};
  const title = program.title;
  const description = (program.desc || program.description || "").slice(0, 160);
  const image = program.img || program.image || "";
  return {
    title: `${title}`,
    description,
    alternates: { canonical: `/programs/${id}` },
    openGraph: {
      title: `${title}`,
      description,
      type: "article",
      url: `${baseUrl}/programs/${id}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" });
  const programs = (all || []).filter((p: any) => p.status === "published");
  if (!programs.some((p: any) => p.id === id)) notFound();
  const program = programs.find((p: any) => p.id === id);
  if (!program) notFound();
  const jsonLd = program
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: program.title,
        description: program.desc || program.description || "",
        image: program.img || program.image || "",
        provider: {
          "@type": "Organization",
          name: "Brilliant Minds Ambassadors Club",
          url: baseUrl,
        },
        offers: program.is_paid
          ? { "@type": "Offer", price: Number(program.price || 0), priceCurrency: "NGN" }
          : undefined,
      }
    : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProgramDetailClient
        id={id}
        initialPrograms={programs || []}
        programContent={<Markdown>{(program as any).long_desc || (program as any).longDesc || ""}</Markdown>}
      />
    </>
  );
}
