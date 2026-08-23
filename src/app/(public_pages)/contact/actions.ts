"use server";

import { logActivity } from "@/lib/activity-log";
import { getSuperAdminEmails } from "@/lib/notifications";
import { sendContactAdminAlertEmail, sendContactAutoreplyEmail } from "@/lib/email";
import { assertSafe, getClientIp, recordSubmission, HONEYPOT_FIELD } from "@/lib/spam-guard";

export async function sendContactMessage(
  prev: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;
  const privacy = formData.get("privacy") as string;
  const marketing = formData.get("marketing") as string;
  const honeypot = formData.get(HONEYPOT_FIELD);

  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { success: true };
  }

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }
  if (privacy !== "on" && privacy !== "true" && privacy !== "1") {
    return { error: "Please accept the privacy policy to continue" };
  }

  const ip = await getClientIp();
  const guard = await assertSafe("contact", email || "", ip);
  if (guard.error) return { error: guard.error };

  try {
    const autoReply = await sendContactAutoreplyEmail({ email, firstName: name });
    if (autoReply.error) console.error("contact-autoreply email error:", autoReply.error);

    const adminEmails = await getSuperAdminEmails();
    await Promise.all(
      adminEmails.map(adminEmail =>
        sendContactAdminAlertEmail({
          email: adminEmail,
          name,
          senderEmail: email,
          phone: phone || "",
          message,
        }).catch(() => ({ error: "alert email failed" }))
      )
    );

    logActivity(email, "contact_submit", "contact", { details: `Message from ${name}: ${message.slice(0, 100)}` });

    await recordSubmission("contact", email || "", ip);

    return { success: true };
  } catch (err) {
    console.error("Contact email error:", err);
    return { error: "Failed to send message. Please try again later." };
  }
}
