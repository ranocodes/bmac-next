import { requirePage } from "@/lib/auth/server";
import { listApplicationWorkflows } from "@/actions/workflows";
import Inbox from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  try {
    await requirePage("manage_workflows");
    const items = await listApplicationWorkflows({ limit: 200 }).catch(() => []);
    return <Inbox initialData={items} />;
  } catch (e) {
    console.error("InboxPage error:", e);
    return (
      <div className="max-w-[1400px]">
        <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-2">Inbox</h1>
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-24 min-h-[400px]">
          <p className="text-sm text-muted-foreground">Failed to load inbox</p>
        </div>
      </div>
    );
  }
}
