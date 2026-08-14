"use server";

import { db } from "@/lib/db";
import { logActivity } from "./activity-logs";
import { findOrCreatePerson } from "./people";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function subscribeToNewsletter(email: string): Promise<{ error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Valid email required" };
  }

  try {
    await db.query(
      "INSERT INTO public.newsletter_subscribers (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email.toLowerCase(), "newsletter_modal"]
    );
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
