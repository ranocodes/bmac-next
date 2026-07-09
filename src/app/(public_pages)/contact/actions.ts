"use server";

import { Resend } from "resend";
import { logActivity } from "@/actions/activity-logs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(
  prev: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }

  try {
    await resend.emails.send({
      from: "BMAC Contact <onboarding@resend.dev>",
      to: ["hello@bmacjos.org"],
      subject: `Contact Form: ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "N/A"}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
    });
    logActivity(email, "contact_submit", "contact", { details: `Message from ${name}: ${message.slice(0, 100)}` }).catch(() => {});
    return { success: true };
  } catch (err) {
    console.error("Resend error:", err);
    return { error: "Failed to send message. Please try again later." };
  }
}
