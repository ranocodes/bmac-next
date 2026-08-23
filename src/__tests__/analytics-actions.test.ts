import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}));

vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => undefined }),
}));

vi.mock("@/lib/auth/server", () => ({
  requirePermission: vi.fn().mockResolvedValue({ email: "admin@bmac.test" }),
}));

import {
  getTrafficOverview,
  getDailyViewsSeries,
  getTopPages,
  getReferrers,
  getDeviceBreakdown,
  getConversionFunnels,
} from "@/actions/analytics";

describe("analytics traffic actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getTrafficOverview computes totals, unique visitors, today and avg daily", async () => {
    mockQuery
      .mockResolvedValueOnce([{ count: "1200" }])
      .mockResolvedValueOnce([{ count: "400" }])
      .mockResolvedValueOnce([{ count: "55" }])
      .mockResolvedValueOnce([{ count: "20" }]);

    const out = await getTrafficOverview();
    expect(out).toEqual({ totalViews: 1200, uniqueVisitors: 400, todayViews: 55, avgDailyViews: 60 });
  });

  it("getTrafficOverview swallows DB errors and returns zeros", async () => {
    mockQuery.mockRejectedValue(new Error("down"));
    const out = await getTrafficOverview();
    expect(out.totalViews).toBe(0);
    expect(out.uniqueVisitors).toBe(0);
    expect(out.todayViews).toBe(0);
    expect(out.avgDailyViews).toBe(0);
  });

  it("getDailyViewsSeries maps rows to date/views/visitors", async () => {
    mockQuery.mockResolvedValue([
      { view_date: "2026-08-01", views: "10", visitors: "5" },
      { view_date: "2026-08-02", views: "20", visitors: "8" },
    ]);
    const out = await getDailyViewsSeries(30);
    expect(out).toEqual([
      { date: "2026-08-01", views: 10, visitors: 5 },
      { date: "2026-08-02", views: 20, visitors: 8 },
    ]);
  });

  it("getTopPages maps path/count to path/views", async () => {
    mockQuery.mockResolvedValue([
      { path: "/", count: "100" },
      { path: "/events", count: "40" },
    ]);
    expect(await getTopPages()).toEqual([
      { path: "/", views: 100 },
      { path: "/events", views: 40 },
    ]);
  });

  it("getReferrers groups by host and labels empty referrers as (direct)", async () => {
    mockQuery.mockResolvedValue([
      { referrer: "https://google.com/x", count: "30" },
      { referrer: "", count: "50" },
      { referrer: "https://google.com/y", count: "10" },
    ]);
    expect(await getReferrers()).toEqual([
      { host: "(direct)", views: 50 },
      { host: "google.com", views: 40 },
    ]);
  });

  it("getDeviceBreakdown maps device types", async () => {
    mockQuery.mockResolvedValue([
      { type: "mobile", count: "70" },
      { type: "desktop", count: "30" },
    ]);
    expect(await getDeviceBreakdown()).toEqual([
      { type: "mobile", count: 70 },
      { type: "desktop", count: 30 },
    ]);
  });
});

describe("getConversionFunnels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes event counts and funnel rates against total page views", async () => {
    mockQuery
      .mockResolvedValueOnce([
        { name: "donation_completed", count: "10" },
        { name: "event_registered", count: "50" },
      ])
      .mockResolvedValueOnce([{ count: "1000" }]);

    const out = await getConversionFunnels();
    expect(out.eventCounts).toEqual([
      { name: "donation_completed", count: 10 },
      { name: "event_registered", count: 50 },
    ]);
    const byStep = Object.fromEntries(out.funnel.map(s => [s.step, s]));
    expect(byStep.page_view.count).toBe(1000);
    expect(byStep.page_view.rate).toBe(100);
    expect(byStep.event_registered.count).toBe(50);
    expect(byStep.event_registered.rate).toBe(5);
    expect(byStep.donation_completed.count).toBe(10);
    expect(byStep.donation_completed.rate).toBe(1);
  });

  it("returns zeros when no page views exist", async () => {
    mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: "0" }]);
    const out = await getConversionFunnels();
    expect(out.funnel.every(s => s.rate === 0)).toBe(true);
  });

  it("swallows DB errors", async () => {
    mockQuery.mockRejectedValue(new Error("down"));
    const out = await getConversionFunnels();
    expect(out.eventCounts).toEqual([]);
    expect(out.funnel).toHaveLength(3);
  });
});
