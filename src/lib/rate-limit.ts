import { db } from "@/lib/db";

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function countRecentFailures(email: string, ip: string): Promise<number> {
  try {
    const since = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
    const rows = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count
       FROM public.login_attempts
       WHERE LOWER(email) = LOWER($1) AND ip = $2 AND success = FALSE AND created_at > $3`,
      [email, ip, since]
    );
    return Number(rows[0]?.count ?? 0);
  } catch (err) {
    console.error("countRecentFailures error:", err);
    return 0;
  }
}

export async function isLoginLocked(email: string, ip: string): Promise<boolean> {
  const failures = await countRecentFailures(email, ip);
  return failures >= LOGIN_MAX_FAILURES;
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
  try {
    await db.create("login_attempts", {
      id: `la-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      email: (email || "").toLowerCase(),
      ip: ip || "",
      success,
      created_at: new Date().toISOString(),
    });
    if (success) {
      await db.query(
        "DELETE FROM public.login_attempts WHERE LOWER(email) = LOWER($1) AND ip = $2",
        [email, ip]
      );
    }
  } catch (err) {
    console.error("recordLoginAttempt error:", err);
  }
}
