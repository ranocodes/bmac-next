export interface UtmParams {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export function getUtmFromSearch(search: string): UtmParams {
  const params = new URLSearchParams(search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
  };
}

export function detectDevice(navigator: {
  userAgent: string;
  userAgentData?: { mobile?: boolean };
}): string {
  if (typeof navigator.userAgentData?.mobile === "boolean") {
    return navigator.userAgentData.mobile ? "mobile" : "desktop";
  }
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop";
}

export function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "edge";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "chrome";
  if (/Firefox\//i.test(ua)) return "firefox";
  if (/Safari\//i.test(ua)) return "safari";
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "opera";
  return "other";
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!name || typeof name !== "string") return;
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, properties }),
    keepalive: true,
  }).catch(() => {});
}
