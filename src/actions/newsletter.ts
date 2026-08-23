"use server";

import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { findOrCreatePerson } from "@/lib/people";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import { assertSafe, getClientIp, recordSubmission, HONEYPOT_FIELD } from "@/lib/spam-guard";

export async function subscribeToNewsletter(email: string, opts: { [HONEYPOT_FIELD]?: string } = {}): Promise<{ error?: string }> {
  const guard = await assertSafe("newsletter", email, await getClientIp(), opts as Record<string, unknown>);
  if (guard.error) return { error: guard.error };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Valid email required" };
  }

  try {
    await db.query(
      "INSERT INTO public.newsletter_subscribers (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email.toLowerCase(), "newsletter_modal"]
    );
    await recordSubmission("newsletter", email, await getClientIp());
    const person = await findOrCreatePerson({ email });
    const sent = await sendNewsletterWelcomeEmail({ email, firstName: person?.firstName || "" });
    if (sent.error) console.error("newsletter-welcome email error:", sent.error);
    logActivity(email, "newsletter_subscribe", "newsletter", { details: `Subscribed: ${email}` });
    return {};
  } catch (err: any) {
    console.error("Newsletter subscribe error:", err);
    return { error: "Something went wrong. Try again." };
  }
}
