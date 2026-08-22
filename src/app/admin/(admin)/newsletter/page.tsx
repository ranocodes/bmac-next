import { requirePage } from "@/lib/auth/server";
import {
  listNewsletterSubscribers,
  listBroadcastHistory,
} from "@/actions/newsletter-admin";
import NewsletterClient from "@/components/admin/NewsletterClient";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  await requirePage("manage_newsletter");
  const [subscribersPage, broadcasts] = await Promise.all([
    listNewsletterSubscribers({ limit: 50 }),
    listBroadcastHistory(),
  ]);

  return (
    <NewsletterClient
      initialSubscribers={subscribersPage.rows}
      initialTotal={subscribersPage.total}
      initialBroadcasts={broadcasts}
    />
  );
}
