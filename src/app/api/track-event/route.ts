import { cookies } from "next/headers";
import { recordEvent } from "@/lib/analytics/record";
import { getClientIp } from "@/lib/spam-guard";

const EVENT_NAME_RE = /^[a-z0-9_]+$/;

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

    const { name, properties } = await req.json();
    if (!name || typeof name !== "string" || name.length > 80 || !EVENT_NAME_RE.test(name)) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const referrer = cap(req.headers.get("referer") || "", 128);
    let safeProperties: Record<string, unknown> =
      properties && typeof properties === "object" ? properties : {};
    if (JSON.stringify(safeProperties).length > 2048) {
      safeProperties = {};
    }

    await recordEvent({
      name,
      path: cap(referrer, 512),
      referrer,
      sessionId,
      properties: safeProperties,
    });

    return Response.json({ ok: true }, {
      headers: {
        "Set-Cookie": `visitor_sid=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`,
      },
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
