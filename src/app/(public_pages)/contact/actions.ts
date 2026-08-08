"use server";

import { logActivity } from "@/actions/activity-logs";
import { findOrCreatePerson, upsertPersonRecord } from "@/actions/people";
import { createWorkflowRecord } from "@/lib/workflows";
import { getSuperAdminEmails } from "@/lib/notifications";
import { sendContactAdminAlertEmail, sendContactAutoreplyEmail } from "@/lib/email";
import { recordConsent } from "@/lib/consent";

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

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }
  if (privacy !== "on" && privacy !== "true" && privacy !== "1") {
    return { error: "Please accept the privacy policy to continue" };
  }

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

    try {
      const person = await findOrCreatePerson({ firstName: name, email, phone });
      if (person) {
        await recordConsent(
          person.id,
          { privacy: true, marketing: marketing === "on", contact: true },
          "contact-form"
        );
        await upsertPersonRecord(person.id, "contact", {
          status: "received",
          meta: {
            message: message.slice(0, 500),
            consent: { privacy: true, marketing: marketing === "on" },
          },
        });
        await createWorkflowRecord({
          kind: "contact",
          refId: person.id,
          title: `Contact: ${name}`,
          summary: message.slice(0, 300),
          priority: "normal",
          submitterName: name,
          submitterEmail: email,
          source: "contact-form",
          details: {
            phone: phone || "",
            message: message.slice(0, 500),
            consent: { privacy: true, marketing: marketing === "on" },
          },
        });
      }
    } catch (err) {
      console.error("Contact persistence error:", err);
    }

    return { success: true };
  } catch (err) {
    console.error("Contact email error:", err);
    return { error: "Failed to send message. Please try again later." };
  }
}
