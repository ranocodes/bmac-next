import { requirePage } from "@/lib/auth/server";
import { listNewsletterSubscribers } from "@/actions/newsletter-admin";
import NewsletterClient from "@/components/admin/NewsletterClient";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  await requirePage("manage_newsletter");
  const subscribers = await listNewsletterSubscribers();
  return <NewsletterClient initialSubscribers={subscribers} />;
}
