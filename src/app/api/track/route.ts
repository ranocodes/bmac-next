import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { getClientIp } from "@/lib/spam-guard";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (hits.get(key) || []).filter(t => t > windowStart);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      if (!times.some(t => t > windowStart)) hits.delete(k);
    }
  }
  return false;
}

function cap(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("visitor_sid")?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    if (isRateLimited(`${sessionId}:${await getClientIp()}`)) {
      return Response.json({ ok: false }, { status: 429 });
    }

    const body = await req.json();
    const { path } = body;
    if (!path || typeof path !== "string") {
      return Response.json({ ok: false }, { status: 400 });
    }

    const referrer = cap(req.headers.get("referer") || "", 128);
    const userAgent = req.headers.get("user-agent") || "";

    const str = (v: unknown) => typeof v === "string" ? v : "";
    const utmSource = cap(str(body.utmSource), 128);
    const utmMedium = cap(str(body.utmMedium), 128);
    const utmCampaign = cap(str(body.utmCampaign), 128);
    const deviceType = cap(str(body.deviceType), 128);
    const browser = cap(str(body.browser), 128);

    await db.query(
      `INSERT INTO public.page_views (path, referrer, user_agent, session_id, view_date, utm_source, utm_medium, utm_campaign, device_type, browser)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9)`,
      [cap(path, 512), referrer, userAgent, sessionId, utmSource, utmMedium, utmCampaign, deviceType, browser]
    );

    return Response.json({ ok: true }, {
      headers: {
        "Set-Cookie": `visitor_sid=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`,
      },
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
