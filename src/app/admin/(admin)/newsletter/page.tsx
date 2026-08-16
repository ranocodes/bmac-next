import { requirePage } from "@/lib/auth/server";
import {
  listNewsletterSubscribers,
  listNewsletterSources,
  listBroadcastHistory,
  listNewsletterTemplates,
} from "@/actions/newsletter-admin";
import NewsletterClient from "@/components/admin/NewsletterClient";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  await requirePage("manage_newsletter");
  const [subscribersPage, sources, broadcasts, templates] = await Promise.all([
    listNewsletterSubscribers({ limit: 50 }),
    listNewsletterSources(),
    listBroadcastHistory(),
    listNewsletterTemplates(),
  ]);

  return (
    <NewsletterClient
      initialSubscribers={subscribersPage.rows}
      initialTotal={subscribersPage.total}
      initialSources={sources}
      initialBroadcasts={broadcasts}
      initialTemplates={templates}
      cronEnabled={!!process.env.CRON_SECRET}
    />
  );
}
