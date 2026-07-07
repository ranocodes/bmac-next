import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
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

    await db.query(
      `INSERT INTO public.page_views (path, referrer, user_agent, session_id, view_date) VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [path, referrer, userAgent, sessionId]
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
