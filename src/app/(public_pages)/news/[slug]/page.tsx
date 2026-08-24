import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "@/components/ui/Markdown";
import NewsDetailClient from "./NewsDetailClient";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const baseUrl = SITE_URL;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [news] = await Promise.all([
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  const article = (news || []).find((n: any) => n.status === "published" && (n.slug === slug || n.id === slug));
  if (!article) return {};
  const title = article.title;
  const description = (article.desc || article.description || "").slice(0, 160);
  const image = article.img_url || article.img || "";
  const path = `/news/${article.slug || article.id}`;
  return {
    title: `${title}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title}`,
      description,
      type: "article",
      url: `${baseUrl}${path}`,
      publishedTime: article.created_at || undefined,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [news, events] = await Promise.all([
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  const publishedNews = (news || []).filter((n: any) => n.status === "published");
  if (!publishedNews.some((n: any) => n.slug === slug || n.id === slug)) notFound();
  const article = publishedNews.find((n: any) => n.slug === slug || n.id === slug);
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
        id={slug}
        initialNews={publishedNews}
        initialEvents={(events || []).filter((e: any) => e.status === "published")}
        articleContent={<Markdown>{publishedNews.find((a: any) => a.slug === slug || a.id === slug)?.content || ""}</Markdown>}
      />
    </>
  );
}
