import { requirePage } from "@/lib/auth/server";
import { listApplicationWorkflows, getApplicationInboxStats } from "@/actions/workflows";
import Inbox from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  await requirePage("manage_workflows");
  const [items, stats] = await Promise.all([
    listApplicationWorkflows({ limit: 200 }),
    getApplicationInboxStats(),
  ]);
  return <Inbox initialData={items} stats={stats} />;
}
