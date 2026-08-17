import { requirePage } from "@/lib/auth/server";
import { listWorkflows, getInboxStats } from "@/actions/workflows";
import Inbox from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  await requirePage("manage_workflows");
  const [items, stats] = await Promise.all([
    listWorkflows({ limit: 200 }),
    getInboxStats(),
  ]);
  return <Inbox initialData={items} stats={stats} />;
}
