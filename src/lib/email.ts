import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<{ error?: string }> {
  try {
    await resend.emails.send({
      from: "BMAC Admin <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your BMAC Admin password",
      text: [
        "You requested a password reset for the BMAC Admin panel.",
        "",
        `Click the link below to reset your password. This link expires in 1 hour.`,
        "",
        resetLink,
        "",
        "If you didn't request this, you can safely ignore this email.",
      ].join("\n"),
    });
    return {};
  } catch (err) {
    console.error("Resend error:", err);
    return { error: "Failed to send email" };
  }
}
