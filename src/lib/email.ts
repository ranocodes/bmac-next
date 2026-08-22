"use server";

const SERVICE_URL = (process.env.EMAIL_SERVICE_URL || "http://localhost:3001").replace(/\/+$/, "");
const API_KEY = process.env.EMAIL_SERVICE_API_KEY || "";

function absolutizeUrl(path: string): string {
  if (!path || /^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  return base ? `${base}${path.startsWith("/") ? path : `/${path}`}` : path;
}

export async function sendRequest(body: Record<string, unknown>): Promise<{ error?: string }> {
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

export async function sendAdminDeletedNotification(email: string, deletedAdmin: string, deletedBy: string, reason?: string): Promise<{ error?: string }> {
  return sendRequest({ type: "admin-deleted", email, deletedAdmin, deletedBy, reason: reason || "" });
}

export async function sendAdminCreatedAlertEmail(opts: {
  email: string;
  newAdminEmail: string;
  newAdminRole: string;
  createdBy: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "admin-created",
    email: opts.email,
    newAdminEmail: opts.newAdminEmail,
    newAdminRole: opts.newAdminRole,
    createdBy: opts.createdBy,
  });
}

export async function sendAdminReplyEmail(opts: {
  email: string;
  subject: string;
  body: string;
  originalTitle?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "admin-reply",
    email: opts.email,
    subject: opts.subject,
    body: opts.body,
    originalTitle: opts.originalTitle || "",
  });
}

export async function sendAdminDeleteAttemptAlert(email: string, actor: string): Promise<{ error?: string }> {
  return sendRequest({ type: "admin-delete-attempt", email, actor });
}

export async function sendApplicationReceivedEmail(opts: {
  email: string;
  firstName?: string;
  kindLabel: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "application-received",
    email: opts.email,
    firstName: opts.firstName || "",
    kindLabel: opts.kindLabel,
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

export async function sendRegistrationAlertEmail(opts: {
  email: string;
  attendeeName?: string;
  attendeeEmail?: string;
  eventName?: string;
  dashboardUrl?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "registration-alert",
    email: opts.email,
    attendeeName: opts.attendeeName || "",
    attendeeEmail: opts.attendeeEmail || "",
    eventName: opts.eventName || "",
    dashboardUrl: absolutizeUrl(opts.dashboardUrl || ""),
  });
}

export async function sendTicketAlertEmail(opts: {
  email: string;
  attendeeName?: string;
  attendeeEmail?: string;
  eventName?: string;
  amountLabel?: string;
  reference?: string;
  dashboardUrl?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "ticket-alert",
    email: opts.email,
    attendeeName: opts.attendeeName || "",
    attendeeEmail: opts.attendeeEmail || "",
    eventName: opts.eventName || "",
    amountLabel: opts.amountLabel || "",
    reference: opts.reference || "",
    dashboardUrl: absolutizeUrl(opts.dashboardUrl || ""),
  });
}

export async function sendCheckInAlertEmail(opts: {
  email: string;
  attendeeName?: string;
  eventName?: string;
  dashboardUrl?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "checkin-alert",
    email: opts.email,
    attendeeName: opts.attendeeName || "",
    eventName: opts.eventName || "",
    dashboardUrl: absolutizeUrl(opts.dashboardUrl || ""),
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
    passUrl: absolutizeUrl(opts.passUrl || ""),
  });
}

export async function sendTicketReceiptEmail(opts: {
  email: string;
  firstName?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
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
    eventDate: opts.eventDate || "",
    eventLocation: opts.eventLocation || "",
    quantity: opts.quantity || 0,
    amountLabel: opts.amountLabel || "",
    passUrl: absolutizeUrl(opts.passUrl || ""),
    reference: opts.reference || "",
  });
}

export async function sendApplicationStatusEmail(opts: {
  email: string;
  firstName?: string;
  kindLabel?: string;
  status?: string;
  note?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "application-status",
    email: opts.email,
    firstName: opts.firstName || "",
    kindLabel: opts.kindLabel || "",
    status: opts.status || "",
    note: opts.note || "",
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
    passUrl: absolutizeUrl(opts.passUrl || ""),
  });
}

export async function sendPaymentVerifiedEmail(opts: {
  email: string;
  firstName?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
  passUrl?: string;
  reference?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "payment-verified",
    email: opts.email,
    firstName: opts.firstName || "",
    eventName: opts.eventName,
    eventDate: opts.eventDate || "",
    eventLocation: opts.eventLocation || "",
    passUrl: absolutizeUrl(opts.passUrl || ""),
    reference: opts.reference || "",
  });
}

export async function sendNewsletterBroadcastEmail(opts: {
  email: string;
  firstName?: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  unsubscribeUrl?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "newsletter-broadcast",
    email: opts.email,
    firstName: opts.firstName || "",
    subject: opts.subject,
    body: opts.body,
    bodyHtml: opts.bodyHtml || "",
    unsubscribeUrl: absolutizeUrl(opts.unsubscribeUrl || ""),
  });
}

export async function sendPublicCredentialsEmail(opts: {
  email: string;
  firstName?: string;
  password: string;
  loginUrl: string;
  driveLink?: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "public-credentials",
    email: opts.email,
    firstName: opts.firstName || "",
    password: opts.password,
    loginUrl: absolutizeUrl(opts.loginUrl),
    driveLink: opts.driveLink || "",
  });
}

export async function sendPublicWelcomeEmail(opts: {
  email: string;
  firstName?: string;
  programTitle: string;
  loginUrl: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "public-welcome",
    email: opts.email,
    firstName: opts.firstName || "",
    programTitle: opts.programTitle,
    loginUrl: absolutizeUrl(opts.loginUrl),
  });
}

export async function sendPublicPasswordResetEmail(opts: {
  email: string;
  resetLink: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "public-password-reset",
    email: opts.email,
    resetLink: absolutizeUrl(opts.resetLink),
  });
}

export async function sendPaymentRequiredEmail(opts: {
  email: string;
  firstName?: string;
  programTitle: string;
  amountLabel: string;
  reference: string;
  paymentUrl: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "payment-required",
    email: opts.email,
    firstName: opts.firstName || "",
    programTitle: opts.programTitle,
    amountLabel: opts.amountLabel,
    reference: opts.reference,
    paymentLink: absolutizeUrl(opts.paymentUrl),
  });
}

export async function sendWhatsAppInviteEmail(opts: {
  email: string;
  firstName?: string;
  programTitle: string;
  whatsappLink: string;
}): Promise<{ error?: string }> {
  return sendRequest({
    type: "whatsapp-invite",
    email: opts.email,
    firstName: opts.firstName || "",
    programTitle: opts.programTitle,
    whatsappLink: opts.whatsappLink,
  });
}
