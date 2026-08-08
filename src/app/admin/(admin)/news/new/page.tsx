import NewsForm from "@/components/admin/NewsForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewNewsPage() {
  await requirePage("manage_news");
  return <NewsForm />;
}
