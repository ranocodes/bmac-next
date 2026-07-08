import { db } from "@/lib/db";
import NewsForm from "@/components/admin/NewsForm";

export default async function EditNewsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("news_articles", id).catch(() => null);
  return <NewsForm initialData={item} />;
}
