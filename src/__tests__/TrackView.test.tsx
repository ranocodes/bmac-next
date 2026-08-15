import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import "./mocks";
import TrackView from "@/components/TrackView";
import { mockUsePathname } from "./mocks";

vi.mock("@/lib/analytics/track", () => ({
  getUtmFromSearch: (search: string) => {
    const utm: Record<string, string> = {};
    const params = new URLSearchParams(search);
    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    if (source) utm.utmSource = source;
    if (medium) utm.utmMedium = medium;
    if (campaign) utm.utmCampaign = campaign;
    return utm;
  },
  detectDevice: () => "desktop",
  detectBrowser: () => "test-browser",
}));

describe("TrackView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUsePathname.mockReturnValue("/");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("skips tracking on /admin paths", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    mockUsePathname.mockReturnValue("/admin");

    render(<TrackView />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("posts path and utm fields on public pages after the 500ms debounce", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<TrackView />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/track");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body).toEqual(
      expect.objectContaining({
        path: "/",
        deviceType: "desktop",
        browser: "test-browser",
      })
    );
    vi.unstubAllGlobals();
  });

  it("includes utm params parsed from the URL search", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("location", { ...window.location, search: "?utm_source=google&utm_medium=cpc&utm_campaign=launch" });

    render(<TrackView />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body).toEqual(
      expect.objectContaining({
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "launch",
      })
    );
    vi.unstubAllGlobals();
  });
});
