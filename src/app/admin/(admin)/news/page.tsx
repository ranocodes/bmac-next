import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import NewsTable from "@/components/admin/NewsTable";

export default async function NewsPage() {
  await requirePage("manage_news");
  const items = await db.getAll<any>("news_articles").catch(() => []);
  return <NewsTable initialData={items} />;
}
