export const SMS_DISABLED = "SMS not configured";

export function smsConfigured(): boolean {
  return Boolean(process.env.TERMII_API_KEY && process.env.TERMII_BASE_URL && process.env.TERMII_SENDER_ID);
}

export function normalizePhone(phone: string): string {
  let p = (phone || "").trim().replace(/[^+\d]/g, "");
  if (!p) return "";
  if (p.startsWith("0")) {
    p = `+234${p.slice(1)}`;
  } else if (!p.startsWith("+")) {
    p = `+${p}`;
  }
  return p;
}

export async function sendSms(opts: {
  phone: string;
  message: string;
  channel?: "sms" | "whatsapp" | "dnd";
}): Promise<{ error?: string }> {
  const phone = normalizePhone(opts.phone);
  if (!phone) {
    return { error: "Missing or invalid phone number" };
  }
  if (!smsConfigured()) {
    return { error: SMS_DISABLED };
  }
  const channel = opts.channel || (process.env.TERMII_WHATSAPP_CHANNEL ? "whatsapp" : "dnd");
  try {
    const res = await fetch(`${process.env.TERMII_BASE_URL}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        to: phone,
        from: process.env.TERMII_SENDER_ID,
        sms: opts.message,
        type: "plain",
        channel,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
    if (!res.ok) {
      return { error: `Termii error ${data.code || res.status}: ${data.message || res.statusText}` };
    }
    return {};
  } catch (err) {
    console.error("sendSms error:", err);
    return { error: "SMS delivery failed" };
  }
}

export async function sendEventReminderSms(opts: {
  phone: string;
  firstName?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
}): Promise<{ error?: string }> {
  const when = opts.eventDate ? ` on ${opts.eventDate}` : "";
  const where = opts.eventLocation ? ` at ${opts.eventLocation}` : "";
  return sendSms({
    phone: opts.phone,
    message: `Reminder: ${opts.eventName}${when}${where}. Don't miss it! Reply STOP to opt out.`,
  });
}
