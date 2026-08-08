import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import Inbox from "@/components/admin/Inbox";

export default async function InboxPage() {
  await requirePage("manage_workflows");
  const items = await db
    .query<any>(
      `SELECT * FROM public.workflow_records
       WHERE kind IN ('contact','member','volunteer','partner','program','donation','event_registration','ticket')
       ORDER BY created_at DESC LIMIT 200`
    )
    .catch(() => []);
  return <Inbox initialData={items} />;
}
