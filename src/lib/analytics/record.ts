import { db } from "@/lib/db";
import { cookies } from "next/headers";

interface RecordEventInput {
  name: string;
  path?: string;
  referrer?: string;
  sessionId?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  properties?: Record<string, unknown>;
}

export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    const { name, path = "", referrer = "", sessionId = "", utm, properties = {} } = input;
    if (!name || typeof name !== "string") return;
    let resolvedSessionId = sessionId;
    if (!resolvedSessionId) {
      try {
        resolvedSessionId = (await cookies()).get("visitor_sid")?.value || "";
      } catch {
        resolvedSessionId = "";
      }
    }
    await db.query(
      `INSERT INTO public.analytics_events (name, path, referrer, utm_source, utm_medium, utm_campaign, properties, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        name,
        path,
        referrer,
        utm?.source || "",
        utm?.medium || "",
        utm?.campaign || "",
        JSON.stringify(properties),
        resolvedSessionId,
      ]
    );
  } catch {
    // fire-and-forget — analytics must never break the caller
  }
}
