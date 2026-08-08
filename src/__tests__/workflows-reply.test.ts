import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequirePermission = vi.fn();
const mockGetWorkflow = vi.fn();
const mockUpdateWorkflow = vi.fn();
const mockLogActivity = vi.fn();
const mockSendReply = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}));
vi.mock("@/lib/workflows", () => ({
  getWorkflow: (...args: unknown[]) => mockGetWorkflow(...args),
  updateWorkflow: (...args: unknown[]) => mockUpdateWorkflow(...args),
}));
vi.mock("@/lib/email", () => ({
  sendAdminReplyEmail: (...args: unknown[]) => mockSendReply(...args),
}));
vi.mock("@/actions/activity-logs", () => ({
  logActivity: (...args: unknown[]) => mockLogActivity(...args),
}));

import { replyToSubmission } from "@/actions/workflows";

const admin = { email: "admin@bmacjos.org", role: "super_admin", permissions: [] };

beforeEach(() => {
  vi.clearAllMocks();
  mockRequirePermission.mockResolvedValue(admin);
});

describe("replyToSubmission", () => {
  it("rejects empty reply body", async () => {
    const result = await replyToSubmission("wf-1", { body: "   " });
    expect(result.error).toBe("Reply body is required");
    expect(mockRequirePermission).toHaveBeenCalledWith("manage_workflows");
    expect(mockSendReply).not.toHaveBeenCalled();
  });

  it("returns error when submission not found", async () => {
    mockGetWorkflow.mockResolvedValue(null);
    const result = await replyToSubmission("wf-1", { body: "Hello" });
    expect(result.error).toBe("Submission not found");
  });

  it("returns error when record has no submitter email", async () => {
    mockGetWorkflow.mockResolvedValue({ id: "wf-1", title: "Contact: Test", submitterEmail: "" });
    const result = await replyToSubmission("wf-1", { body: "Hello" });
    expect(result.error).toBe("No submitter email on this record");
  });

  it("returns error when email send fails", async () => {
    mockGetWorkflow.mockResolvedValue({ id: "wf-1", title: "Contact: Test", submitterEmail: "x@y.z", details: {} });
    mockSendReply.mockResolvedValue({ error: "service down" });
    const result = await replyToSubmission("wf-1", { body: "Hello" });
    expect(result.error).toMatch(/failed to send/i);
    expect(mockUpdateWorkflow).not.toHaveBeenCalled();
  });

  it("sends reply email and records history on success", async () => {
    mockGetWorkflow.mockResolvedValue({
      id: "wf-1",
      title: "Contact: Test",
      submitterEmail: "x@y.z",
      details: { phone: "0800" },
    });
    mockSendReply.mockResolvedValue({});
    mockUpdateWorkflow.mockResolvedValue({});

    const result = await replyToSubmission("wf-1", { body: "Thanks for your message" });

    expect(mockSendReply).toHaveBeenCalledWith({
      email: "x@y.z",
      subject: "Re: Contact: Test",
      body: "Thanks for your message",
      originalTitle: "Contact: Test",
    });
    expect(result.success).toBe(true);
    expect(mockUpdateWorkflow).toHaveBeenCalledTimes(1);
    const [id, patch] = mockUpdateWorkflow.mock.calls[0];
    expect(id).toBe("wf-1");
    expect(patch.lastContactedAt).toBeTruthy();
    expect(patch.details.history).toHaveLength(1);
    expect(patch.details.history[0]).toMatchObject({ type: "reply", by: "admin@bmacjos.org", note: "Thanks for your message" });
    expect(mockLogActivity).toHaveBeenCalledWith("admin@bmacjos.org", "reply", "workflow_records", expect.objectContaining({ resourceId: "wf-1" }));
  });

  it("appends to existing history instead of replacing", async () => {
    mockGetWorkflow.mockResolvedValue({
      id: "wf-1",
      title: "Contact: Test",
      submitterEmail: "x@y.z",
      details: { history: [{ type: "reply", by: "a@b.c", at: "2026-01-01", note: "first" }] },
    });
    mockSendReply.mockResolvedValue({});
    mockUpdateWorkflow.mockResolvedValue({});

    await replyToSubmission("wf-1", { body: "second reply" });

    const patch = mockUpdateWorkflow.mock.calls[0][1];
    expect(patch.details.history).toHaveLength(2);
    expect(patch.details.history[0].note).toBe("first");
    expect(patch.details.history[1].note).toBe("second reply");
  });
});
