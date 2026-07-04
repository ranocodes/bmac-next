import { db } from "@/lib/db";
import NewsTable from "@/components/admin/NewsTable";

export default async function NewsPage() {
  const items = await db.getAll<any>("news_articles").catch(() => []);
  return <NewsTable initialData={items} />;
}
