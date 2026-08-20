import { NextResponse } from "next/server";
import { processEmailSequences } from "@/actions/email-sequences";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("authorization")?.replace(/^Bearer /, "");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && token && token === secret);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processEmailSequences();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Email sequences cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
