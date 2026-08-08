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
  } catch (err: unknown) {
    console.error("Email service error:", err);
    return { error: "Failed to send email" };
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<{ error?: string }> {
  return sendRequest({ type: "password-reset", email, resetLink });
}

export async function sendAdminDeletedNotification(email: string, deletedAdmin: string, deletedBy: string): Promise<{ error?: string }> {
  return sendRequest({ type: "admin-deleted", email, deletedAdmin, deletedBy });
}

export async function sendAdminDeleteAttemptAlert(email: string, actor: string): Promise<{ error?: string }> {
  return sendRequest({ type: "admin-delete-attempt", email, actor });
}

export async function sendGoogleFormLinkEmail(opts: {
  email: string;
  firstName?: string;
  kindLabel: string;
  formLink: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "google-forms-link",
    email: opts.email,
    firstName: opts.firstName || "",
    kindLabel: opts.kindLabel,
    formLink: opts.formLink,
  });
}

export async function sendDonationThanksEmail(opts: {
  email: string;
  firstName?: string;
  amountLabel: string;
  reference: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "donation-thanks",
    email: opts.email,
    firstName: opts.firstName || "",
    amountLabel: opts.amountLabel,
    reference: opts.reference,
  });
}

export async function sendDonationAlertEmail(opts: {
  email: string;
  donorName?: string;
  donorEmail?: string;
  amountLabel: string;
  reference: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "donation-alert",
    email: opts.email,
    donorName: opts.donorName || "",
    donorEmail: opts.donorEmail || "",
    amountLabel: opts.amountLabel,
    reference: opts.reference,
  });
}

export async function sendFormSubmitAlertEmail(opts: {
  email: string;
  submitterName?: string;
  submitterEmail?: string;
  kindLabel: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "form-submit-alert",
    email: opts.email,
    submitterName: opts.submitterName || "",
    submitterEmail: opts.submitterEmail || "",
    kindLabel: opts.kindLabel,
  });
}

export async function sendContactAutoreplyEmail(opts: {
  email: string;
  firstName?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "contact-autoreply",
    email: opts.email,
    firstName: opts.firstName || "",
  });
}

export async function sendContactAdminAlertEmail(opts: {
  email: string;
  name?: string;
  senderEmail?: string;
  phone?: string;
  message?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "contact-admin-alert",
    email: opts.email,
    name: opts.name || "",
    senderEmail: opts.senderEmail || "",
    phone: opts.phone || "",
    message: opts.message || "",
  });
}

export async function sendNewsletterWelcomeEmail(opts: {
  email: string;
  firstName?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "newsletter-welcome",
    email: opts.email,
    firstName: opts.firstName || "",
  });
}

export async function sendRegistrationConfirmedEmail(opts: {
  email: string;
  firstName?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
  passUrl?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "registration-confirmed",
    email: opts.email,
    firstName: opts.firstName || "",
    eventName: opts.eventName,
    eventDate: opts.eventDate || "",
    eventLocation: opts.eventLocation || "",
    passUrl: opts.passUrl || "",
  });
}

export async function sendTicketReceiptEmail(opts: {
  email: string;
  firstName?: string;
  eventName: string;
  quantity?: number;
  amountLabel?: string;
  passUrl?: string;
  reference?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "ticket-receipt",
    email: opts.email,
    firstName: opts.firstName || "",
    eventName: opts.eventName,
    quantity: opts.quantity || 0,
    amountLabel: opts.amountLabel || "",
    passUrl: opts.passUrl || "",
    reference: opts.reference || "",
  });
}

export async function sendApplicationStatusEmail(opts: {
  email: string;
  firstName?: string;
  kindLabel?: string;
  status?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "application-status",
    email: opts.email,
    firstName: opts.firstName || "",
    kindLabel: opts.kindLabel || "",
    status: opts.status || "",
  });
}

export async function sendEventReminderEmail(opts: {
  email: string;
  firstName?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
  passUrl?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "event-reminder",
    email: opts.email,
    firstName: opts.firstName || "",
    eventName: opts.eventName,
    eventDate: opts.eventDate || "",
    eventLocation: opts.eventLocation || "",
    passUrl: opts.passUrl || "",
  });
}
