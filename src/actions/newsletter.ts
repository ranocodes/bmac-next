"use server";

import { db } from "@/lib/db";
import { logActivity } from "./activity-logs";

export async function subscribeToNewsletter(email: string): Promise<{ error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Valid email required" };
  }

  try {
    await db.query(
      "INSERT INTO public.newsletter_subscribers (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email.toLowerCase(), "newsletter_modal"]
    );
    logActivity(email, "newsletter_subscribe", "newsletter", { details: `Subscribed: ${email}` }).catch(() => {});
    return {};
  } catch (err: any) {
    console.error("Newsletter subscribe error:", err);
    return { error: "Something went wrong. Try again." };
  }
}
