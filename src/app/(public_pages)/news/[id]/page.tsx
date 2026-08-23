import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NewsDetailClient from "./NewsDetailClient";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [news] = await Promise.all([
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  const article = (news || []).find((n: any) => n.status === "published" && n.id === id);
  if (!article) return {};
  const title = article.title;
  const description = (article.desc || article.description || "").slice(0, 160);
  const image = article.img_url || article.img || "";
  return {
    title: `${title}`,
    description,
    alternates: { canonical: `/news/${id}` },
    openGraph: {
      title: `${title}`,
      description,
      type: "article",
      url: `${baseUrl}/news/${id}`,
      publishedTime: article.created_at || undefined,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [news, events] = await Promise.all([
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  const publishedNews = (news || []).filter((n: any) => n.status === "published");
  if (!publishedNews.some((n: any) => n.id === id)) notFound();
  const article = publishedNews.find((n: any) => n.id === id);
  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.desc || article.description || "",
        image: article.img_url || article.img || "",
        datePublished: article.created_at || article.date || undefined,
        author: { "@type": "Organization", name: "Brilliant Minds Ambassadors Club" },
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
      <NewsDetailClient
        id={id}
        initialNews={publishedNews}
        initialEvents={(events || []).filter((e: any) => e.status === "published")}
      />
    </>
  );
}
