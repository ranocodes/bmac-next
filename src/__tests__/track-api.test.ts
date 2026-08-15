import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn().mockResolvedValue([]);
const mockCookieGet = vi.fn().mockReturnValue({ value: "sess-existing" });

vi.mock("@/lib/db", () => ({
  db: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: (...args: unknown[]) => mockCookieGet(...args) }),
}));

async function postTrack(body: unknown) {
  const { POST } = await import("@/app/api/track/route");
  const req = new Request("http://localhost:3000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req);
}

async function postTrackEvent(body: unknown) {
  const { POST } = await import("@/app/api/track-event/route");
  const req = new Request("http://localhost:3000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe("api/track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieGet.mockReturnValue({ value: "sess-existing" });
  });

  it("inserts page view with all columns and sets visitor cookie", async () => {
    const res = await postTrack({
      path: "/about",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "launch",
      deviceType: "mobile",
      browser: "Chrome",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO public.page_views"),
      expect.arrayContaining([
        "/about",
        "google",
        "cpc",
        "launch",
        "mobile",
        "Chrome",
        "sess-existing",
      ])
    );
    const params = mockQuery.mock.calls[0][1] as unknown[];
    expect(params).toHaveLength(9);
    const cookie = res.headers.get("set-cookie") || "";
    expect(cookie).toContain("visitor_sid=sess-existing");
  });

  it("creates a new session id when visitor_sid cookie is missing", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const res = await postTrack({ path: "/" });
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") || "";
    expect(cookie).toMatch(/visitor_sid=[0-9a-f-]{36}/);
  });

  it("rejects a request without a path", async () => {
    const res = await postTrack({});
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe("api/track-event", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieGet.mockReturnValue({ value: "sess-existing" });
  });

  it("records a valid business event with properties", async () => {
    const res = await postTrackEvent({
      name: "donation_completed",
      properties: { reference: "BMAC-1", amount: 5000 },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO public.analytics_events"),
      expect.arrayContaining([
        "donation_completed",
        expect.stringContaining('"reference":"BMAC-1"'),
        "sess-existing",
      ])
    );
    const cookie = res.headers.get("set-cookie") || "";
    expect(cookie).toContain("visitor_sid=sess-existing");
  });

  it("rejects invalid event names", async () => {
    for (const bad of ["DonationCompleted", "donation completed", "donation!", "a".repeat(81), ""]) {
      const res = await postTrackEvent({ name: bad, properties: {} });
      expect(res.status).toBe(400);
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
