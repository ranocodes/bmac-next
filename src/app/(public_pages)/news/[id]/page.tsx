import { db } from "@/lib/db";
import NewsDetailClient from "./NewsDetailClient";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [news, events] = await Promise.all([
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  return (
    <NewsDetailClient
      id={id}
      initialNews={(news || []).filter((n: any) => n.status === "published")}
      initialEvents={(events || []).filter((e: any) => e.status === "published")}
    />
  );
}
