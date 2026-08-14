import { db } from "@/lib/db";
import NewsClient from "./NewsClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [news, events] = await Promise.all([
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  return (
    <NewsClient
      initialNews={(news || []).filter((n: any) => n.status === "published")}
      initialEvents={(events || []).filter((e: any) => e.status === "published")}
    />
  );
}
