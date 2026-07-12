"use server";

const SERVICE_URL = (process.env.EMAIL_SERVICE_URL || "http://localhost:3001").replace(/\/+$/, "");
const API_KEY = process.env.EMAIL_SERVICE_API_KEY || "";

async function sendRequest(body: Record<string, unknown>): Promise<{ error?: string }> {
  try {
    const res = await fetch(`${SERVICE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || `Email service error (${res.status})` };
    }
    return {};
  } catch (err: any) {
    console.error("Email service error:", err);
    return { error: "Failed to send email" };
  }
}

export async function sendInviteEmail(email: string, inviteLink: string, firstName: string, tempPassword?: string): Promise<{ error?: string }> {
  return sendRequest({ type: "invite", email, firstName, inviteLink, tempPassword });
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<{ error?: string }> {
  return sendRequest({ type: "password-reset", email, resetLink });
}
