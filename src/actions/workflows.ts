"use server";

import { getWorkflow, updateWorkflow } from "@/lib/workflows";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
import { sendAdminReplyEmail } from "@/lib/email";

export async function replyToSubmission(
  workflowId: string,
  opts: { body: string }
): Promise<{ error?: string; success?: boolean; repliedAt?: string }> {
  const admin = await requirePermission("manage_workflows");
  const body = opts.body?.trim();
  if (!body) return { error: "Reply body is required" };

  const record = await getWorkflow(workflowId);
  if (!record) return { error: "Submission not found" };
  if (!record.submitterEmail) return { error: "No submitter email on this record" };

  const sent = await sendAdminReplyEmail({
    email: record.submitterEmail,
    subject: `Re: ${record.title}`,
    body,
    originalTitle: record.title,
  });
  if (sent.error) return { error: "Reply email failed to send. Try again." };

  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  const repliedAt = new Date().toISOString();
  await updateWorkflow(workflowId, {
    details: {
      ...record.details,
      history: [...history, { type: "reply", by: admin.email, at: repliedAt, note: body }],
    },
    lastContactedAt: repliedAt,
  });
  await logActivity(admin.email, "reply", "workflow_records", {
    resourceId: workflowId,
    details: `Replied to ${record.submitterEmail}: ${body.slice(0, 100)}`,
  });
  return { success: true, repliedAt };
}
