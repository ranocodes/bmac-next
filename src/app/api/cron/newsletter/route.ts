import { NextResponse } from "next/server";
import { flushScheduledBroadcasts } from "@/actions/newsletter-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await flushScheduledBroadcasts();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Newsletter cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
