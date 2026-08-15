import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path } = body;
    if (!path || typeof path !== "string") {
      return Response.json({ ok: false }, { status: 400 });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get("visitor_sid")?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    const referrer = req.headers.get("referer") || "";
    const userAgent = req.headers.get("user-agent") || "";

    const utmSource = typeof body.utmSource === "string" ? body.utmSource : "";
    const utmMedium = typeof body.utmMedium === "string" ? body.utmMedium : "";
    const utmCampaign = typeof body.utmCampaign === "string" ? body.utmCampaign : "";
    const deviceType = typeof body.deviceType === "string" ? body.deviceType : "";
    const browser = typeof body.browser === "string" ? body.browser : "";

    await db.query(
      `INSERT INTO public.page_views (path, referrer, user_agent, session_id, view_date, utm_source, utm_medium, utm_campaign, device_type, browser)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9)`,
      [path, referrer, userAgent, sessionId, utmSource, utmMedium, utmCampaign, deviceType, browser]
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
