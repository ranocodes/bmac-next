import { requirePage } from "@/lib/auth/server";
import { listWorkflows, getWorkflowQueueCounts } from "@/actions/workflows";
import WorkflowQueue from "@/components/admin/WorkflowQueue";

export default async function WorkflowPage() {
  await requirePage("manage_workflows");
  const [records, counts] = await Promise.all([
    listWorkflows({ limit: 100 }),
    getWorkflowQueueCounts(),
  ]);
  return <WorkflowQueue initialData={records} counts={counts} />;
}
