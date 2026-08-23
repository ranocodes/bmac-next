import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();
let nextRows: unknown[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}));

vi.mock("@/lib/auth/server", () => ({
  requirePermission: async () => ({ email: "admin@x.com", firstName: "A", role: "admin", permissions: [] }),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: async () => {},
}));

vi.mock("@/lib/email", () => ({
  sendNewsletterBroadcastEmail: async (opts: { email: string }) =>
    opts.email === "fail@x.com" ? { error: "smtp down" } : {},
}));

import {
  sendNewsletterBroadcast,
  sendNewsletterTest,
  cancelNewsletterBroadcast,
  listBroadcastHistory,
  listNewsletterSources,
  saveNewsletterTemplate,
  deleteNewsletterTemplate,
  scheduleNewsletterBroadcast,
} from "@/actions/newsletter-admin";
import { flushScheduledBroadcasts } from "@/lib/newsletter-broadcast";

function setupChunkQueries({ total, rows }: { total: string; rows: unknown[] }) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (sql.includes("COUNT(*)")) return [{ count: total }];
    if (sql.startsWith("SELECT s.email")) return rows;
    return [];
  });
}

describe("sendNewsletterBroadcast chunked send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends only the requested chunk and reports total/done", async () => {
    setupChunkQueries({
      total: "3",
      rows: [
        { email: "a@x.com", first_name: "A" },
        { email: "fail@x.com", first_name: "" },
      ],
    });

    const out = await sendNewsletterBroadcast({ subject: "Hi", body: "**body**", limit: 2 });

    expect(out.sent).toBe(1);
    expect(out.errors).toBe(1);
    expect(out.total).toBe(3);
    expect(out.done).toBe(false);
    expect(out.campaignId).toMatch(/^bc-/);

    const sentQuery = mockQuery.mock.calls.find((c) => String(c[0]).includes("last_sent_at"));
    const errorQuery = mockQuery.mock.calls.find((c) => String(c[0]).includes("last_error_at"));
    expect(sentQuery).toBeTruthy();
    expect(sentQuery![1]).toEqual(["a@x.com"]);
    expect(errorQuery).toBeTruthy();
    expect(errorQuery![1]).toEqual(["fail@x.com"]);
  });

  it("treats the last chunk as done and logs broadcast", async () => {
    setupChunkQueries({
      total: "2",
      rows: [
        { email: "a@x.com", first_name: "A" },
        { email: "b@x.com", first_name: "" },
      ],
    });

    const out = await sendNewsletterBroadcast({ subject: "Hi", body: "body", offset: 0, limit: 2 });
    expect(out.done).toBe(true);
    expect(out.campaignId).toMatch(/^bc-/);
  });

  it("rejects empty subject or body", async () => {
    const out = await sendNewsletterBroadcast({ subject: "", body: "x" });
    expect(out.error).toMatch(/required/i);
  });
});

describe("sendNewsletterTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends to listed addresses and records a test broadcast row", async () => {
    mockQuery.mockResolvedValue([]);
    const out = await sendNewsletterTest({ subject: "Test", body: "hi", to: "a@x.com, b@x.com" });
    expect(out.sent).toBe(2);
    expect(out.errors).toBe(0);

    const insert = mockQuery.mock.calls.find((c) => String(c[0]).includes("INSERT INTO public.broadcast_log"));
    expect(insert).toBeTruthy();
    expect(insert![1]).toContain("[TEST] Test");
    expect(insert![1]).toContain("test");
  });

  it("rejects invalid recipient emails", async () => {
    const out = await sendNewsletterTest({ subject: "T", body: "hi", to: "not-an-email" });
    expect(out.error).toMatch(/invalid/i);
    expect(out.sent).toBe(0);
  });
});

describe("cancelNewsletterBroadcast", () => {
  it("marks the campaign as aborted", async () => {
    mockQuery.mockResolvedValue([]);
    const out = await cancelNewsletterBroadcast("bc-123");
    expect(out.error).toBeUndefined();
    const update = mockQuery.mock.calls.find((c) => String(c[0]).includes("'aborted'"));
    expect(update).toBeTruthy();
    expect(update![1]).toEqual(["bc-123"]);
  });
});

describe("listBroadcastHistory", () => {
  it("maps rows to camelCase with numeric counts", async () => {
    mockQuery.mockResolvedValue([
      {
        id: "bc-1", subject: "S", status: "sent", audience_source: null,
        recipient_count: "2", sent_count: "2", error_count: "0",
        scheduled_for: null, created_by: "admin@x.com",
        created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
      },
    ]);
    const rows = await listBroadcastHistory();
    expect(rows[0]).toMatchObject({
      id: "bc-1",
      status: "sent",
      recipientCount: 2,
      sentCount: 2,
      errorCount: 0,
    });
    expect(rows[0].audienceSource).toBeNull();
  });
});

describe("listNewsletterSources", () => {
  it("returns distinct sources", async () => {
    mockQuery.mockResolvedValue([{ source: "newsletter_modal" }, { source: "imported" }]);
    expect(await listNewsletterSources()).toEqual(["newsletter_modal", "imported"]);
  });
});

describe("templates", () => {
  it("saves and deletes templates", async () => {
    mockQuery.mockResolvedValue([]);
    expect((await saveNewsletterTemplate({ name: "Welcome", subject: "S", body: "b" })).error).toBeUndefined();
    expect((await deleteNewsletterTemplate("Welcome")).error).toBeUndefined();

    const insert = mockQuery.mock.calls.find((c) => String(c[0]).includes("INSERT INTO public.newsletter_templates"));
    expect(insert![1]).toEqual(["Welcome", "S", "b"]);
    const del = mockQuery.mock.calls.find((c) => String(c[0]).includes("DELETE FROM public.newsletter_templates"));
    expect(del![1]).toEqual(["Welcome"]);
  });

  it("requires a name", async () => {
    expect((await saveNewsletterTemplate({ name: "", subject: "S", body: "b" })).error).toMatch(/required/i);
  });
});

describe("scheduleNewsletterBroadcast", () => {
  it("rejects past times", async () => {
    const out = await scheduleNewsletterBroadcast({
      subject: "S", body: "b", scheduledFor: new Date(Date.now() - 60000).toISOString(),
    });
    expect(out.error).toMatch(/future/i);
  });
});

describe("flushScheduledBroadcasts", () => {
  it("flushes due scheduled broadcasts across chunks", async () => {
    const dueRows = [
      { id: "bc-sched", subject: "S", body_md: "body", audience_source: null },
    ];
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("status = 'scheduled' AND scheduled_for IS NOT NULL")) return dueRows;
      if (sql.includes("status = 'sending'")) return [{ id: "bc-sched" }];
      if (sql.includes("COUNT(*)")) return [{ count: "1" }];
      if (sql.startsWith("SELECT s.email")) return [{ email: "a@x.com", first_name: "A" }];
      return [];
    });

    const out = await flushScheduledBroadcasts();
    expect(out.due).toBe(1);
    expect(out.sent).toBe(1);
    expect(out.errors).toBe(0);
  });

  it("skips rows that were already claimed", async () => {
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("status = 'scheduled' AND scheduled_for IS NOT NULL")) {
        return [{ id: "bc-sched", subject: "S", body_md: "body", audience_source: null }];
      }
      if (sql.includes("status = 'sending'")) return [];
      return [];
    });
    const out = await flushScheduledBroadcasts();
    expect(out.due).toBe(1);
    expect(out.sent).toBe(0);
  });
});
