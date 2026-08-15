import { db } from "@/lib/db";

export const SPAM_MAX_SUBMISSIONS = 5;
export const SPAM_WINDOW_MS = 10 * 60 * 1000;

export const HONEYPOT_FIELD = "company_website";

export function honeypotFilled(payload: Record<string, unknown>): boolean {
  const value = payload[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

export async function isRateLimited(scope: string, email: string, ip: string): Promise<boolean> {
  try {
    const key = `${scope}:${(email || "").toLowerCase().trim()}:${ip || "unknown"}`;
    const since = new Date(Date.now() - SPAM_WINDOW_MS).toISOString();
    const rows = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count
       FROM public.form_submissions
       WHERE key = $1 AND created_at > $2`,
      [key, since]
    );
    return Number(rows[0]?.count ?? 0) >= SPAM_MAX_SUBMISSIONS;
  } catch (err) {
    console.error("isRateLimited error:", err);
    return false;
  }
}

export async function recordSubmission(scope: string, email: string, ip: string): Promise<void> {
  try {
    const key = `${scope}:${(email || "").toLowerCase().trim()}:${ip || "unknown"}`;
    await db.create("form_submissions", {
      id: `fs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      key,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("recordSubmission error:", err);
  }
}

export async function assertSafe(
  scope: string,
  email: string,
  ip: string,
  payload?: Record<string, unknown>
): Promise<{ error?: string }> {
  if (payload && honeypotFilled(payload)) {
    return { error: "Something went wrong. Try again." };
  }
  if (await isRateLimited(scope, email, ip)) {
    return { error: "Too many requests. Try again later." };
  }
  return {};
}

export async function getClientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}
