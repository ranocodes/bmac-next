import { cookies } from "next/headers";
import { recordEvent } from "@/lib/analytics/record";

const EVENT_NAME_RE = /^[a-z0-9_]+$/;

export async function POST(req: Request) {
  try {
    const { name, properties } = await req.json();
    if (!name || typeof name !== "string" || name.length > 80 || !EVENT_NAME_RE.test(name)) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get("visitor_sid")?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    const referrer = req.headers.get("referer") || "";

    await recordEvent({
      name,
      path: referrer,
      referrer,
      sessionId,
      properties: properties && typeof properties === "object" ? properties : {},
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
