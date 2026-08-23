export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export type EmailTemplateKey =
  | "credentials"
  | "password-reset"
  | "admin-deleted"
  | "admin-delete-attempt"
  | "application-received"
  | "donation-thanks"
  | "donation-alert"
  | "form-submit-alert"
  | "admin-reply"
  | "contact-autoreply"
  | "registration-confirmed"
  | "ticket-receipt"
  | "application-status"
  | "event-reminder"
  | "public-credentials"
  | "public-welcome"
  | "payment-required"
  | "payment-verified";

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  credentials: "Admin credentials",
  "password-reset": "Password reset",
  "admin-deleted": "Admin account deleted",
  "admin-delete-attempt": "Self-deletion blocked",
  "application-received": "Application received",
  "donation-thanks": "Donation thank-you",
  "donation-alert": "Donation alert (admins)",
  "form-submit-alert": "Application alert (admins)",
  "admin-reply": "Admin reply to a submission",
  "contact-autoreply": "Contact form acknowledgement",
  "registration-confirmed": "Event registration confirmed",
  "ticket-receipt": "Event ticket receipt",
  "application-status": "Application status update",
  "event-reminder": "Event reminder",
  "public-credentials": "Public account credentials",
  "public-welcome": "Welcome to BMAC program",
  "payment-required": "Payment required after acceptance",
  "payment-verified": "Payment verified — event pass",
};

const shell = (heading: string, message: string, cta?: { label: string; url: string }, footer?: string) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4">
<tr><td style="padding:40px 16px">
<table role="presentation" align="center" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="padding:40px 32px 32px;text-align:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">BMAC<span style="color:#f59e0b">.</span></h1>
<p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:3px">Brilliant Minds Ambassadors Club</p>
</td></tr>
<tr><td style="padding:32px 32px 0">
<h2 style="margin:0;color:#1a1a2e;font-size:20px;font-weight:700">${heading}</h2>
<p style="margin:12px 0 0;color:#555;font-size:15px;line-height:1.6">${message}</p>
</td></tr>
${cta ? `<tr><td style="padding:24px 32px;text-align:center">
<a href="${cta.url}" style="display:inline-block;padding:14px 36px;background-color:#f59e0b;color:#1a1a2e;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px">${cta.label}</a>
</td></tr>
<tr><td style="padding:0 32px">
<p style="margin:0 0 12px;color:#bbb;font-size:12px;line-height:1.5">If the button above doesn't work, copy and paste this URL into your browser:<br>
<span style="color:#f59e0b;word-break:break-all">${cta.url}</span></p>
</td></tr>` : ""}
<tr><td style="padding:0 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="border-top:1px solid #eee;padding:24px 0 32px">
<p style="margin:0;color:#999;font-size:13px;line-height:1.5">${footer || "This is an automated message from the Brilliant Minds Ambassadors Club. Please do not reply to this email."}</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const credentialsShell = () => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4">
<tr><td style="padding:40px 16px">
<table role="presentation" align="center" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="padding:40px 32px 32px;text-align:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">BMAC<span style="color:#f59e0b">.</span></h1>
<p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:3px">Admin Panel</p>
</td></tr>
<tr><td style="padding:32px 32px 0">
<h2 style="margin:0;color:#1a1a2e;font-size:20px;font-weight:700">Your admin account</h2>
<p style="margin:12px 0 0;color:#555;font-size:15px;line-height:1.6">Hi <strong style="color:#1a1a2e">{{firstName}}</strong>,</p>
<p style="margin:8px 0 0;color:#555;font-size:15px;line-height:1.6">An admin account has been created for you on the <strong>BMAC Admin Panel</strong>. Use the credentials below to sign in.</p>
<div style="margin:20px 0;padding:16px;background:#fef9e7;border:1px solid #fde68a;border-radius:12px;text-align:center">
<p style="margin:0 0 4px;color:#92400e;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Email</p>
<p style="margin:0 0 12px;color:#1a1a2e;font-size:16px;font-weight:700;font-family:monospace">{{email}}</p>
<p style="margin:0 0 4px;color:#92400e;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Password</p>
<p style="margin:0;color:#1a1a2e;font-size:18px;font-weight:700;font-family:monospace">{{password}}</p>
<p style="margin:12px 0 0;color:#92400e;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Role</p>
<p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600">{{role}}</p>
</div>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center">
<a href="{{loginLink}}" style="display:inline-block;padding:14px 36px;background-color:#f59e0b;color:#1a1a2e;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px">Sign In to Admin Panel</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  credentials: {
    subject: "Your BMAC Admin credentials",
    html: credentialsShell(),
    text: [
      "Hi {{firstName}},",
      "",
      "An admin account has been created for you on the BMAC Admin Panel.",
      "",
      "Email: {{email}}",
      "Password: {{password}}",
      "Role: {{role}}",
      "",
      "Sign in at: {{loginLink}}",
      "",
      "If you didn't expect this email, you can safely ignore it.",
    ].join("\n"),
  },
  "password-reset": {
    subject: "Reset your BMAC Admin password",
    html: shell(
      "Password Reset",
      "You requested a password reset for your <strong>BMAC Admin Panel</strong> account. Click the button below to set a new one. This link expires in 1 hour.",
      { label: "Reset Password", url: "{{resetLink}}" }
    ),
    text: [
      "You requested a password reset for the BMAC Admin panel.",
      "",
      "Click the link below to reset your password. This link expires in 1 hour.",
      "",
      "{{resetLink}}",
      "",
      "If you didn't request this, you can safely ignore this email.",
    ].join("\n"),
  },
  "admin-deleted": {
    subject: "Admin account deleted — BMAC Admin Panel",
    html: shell(
      "Admin account deleted",
      "The super admin account <strong>{{deletedAdmin}}</strong> was deleted by {{deletedBy}}.{{reason}} If you did not expect this, review your admin accounts.",
      { label: "Go to Admin Panel", url: "{{loginLink}}" }
    ),
    text: "The super admin account {{deletedAdmin}} was deleted by {{deletedBy}}.{{reason}} If you did not expect this, review your admin accounts.\n\nSign in at: {{loginLink}}",
  },
  "admin-delete-attempt": {
    subject: "Self-deletion attempt blocked — BMAC Admin Panel",
    html: shell(
      "Self-deletion attempt blocked",
      "Super admin <strong>{{actor}}</strong> attempted to delete their own account. The action was blocked.",
      { label: "Go to Admin Panel", url: "{{loginLink}}" }
    ),
    text: "Super admin {{actor}} attempted to delete their own account. The action was blocked.\n\nSign in at: {{loginLink}}",
  },
  "application-received": {
    subject: "We received your {{kindLabel}} application — BMAC",
    html: shell(
      "Application received, {{firstName}}!",
      "Thanks for your interest in <strong>{{kindLabel}}</strong>. We've received your application and our team will review it. Expect a response within <strong>48 hours</strong>.",
      undefined,
      "If you did not apply, you can ignore this email. Questions? Reply to this email."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Thanks for your interest in {{kindLabel}}. We've received your application and our team will review it. Expect a response within 48 hours.",
      "",
      "If you did not apply, you can ignore this email. Questions? Reply to this email.",
    ].join("\n"),
  },
  "donation-thanks": {
    subject: "Thank you for your donation to BMAC",
    html: shell(
      "Thank you, {{firstName}}! 🎉",
      "Your generous donation of <strong>{{amountLabel}}</strong> has been received and will go directly toward empowering young people in Plateau State. Reference: <strong>{{reference}}</strong>.",
      { label: "See Our Impact", url: "{{impactUrl}}" },
      "Need a receipt? Reply to this email and we will send you a tax-deductible receipt."
    ),
    text: [
      "Thank you, {{firstName}}!",
      "",
      "Your generous donation of {{amountLabel}} has been received and will go directly toward empowering young people in Plateau State.",
      "Reference: {{reference}}",
      "",
      "See our impact: {{impactUrl}}",
      "",
      "Need a receipt? Reply to this email and we will send you a tax-deductible receipt.",
    ].join("\n"),
  },
  "donation-alert": {
    subject: "New donation received — BMAC",
    html: shell(
      "New donation received",
      "<strong>{{donorName}}</strong> ({{donorEmail}}) donated <strong>{{amountLabel}}</strong>. Reference: <strong>{{reference}}</strong>.",
      { label: "View in Dashboard", url: "{{dashboardUrl}}" }
    ),
    text: [
      "New donation received",
      "",
      "{{donorName}} ({{donorEmail}}) donated {{amountLabel}}.",
      "Reference: {{reference}}",
      "",
      "View in dashboard: {{dashboardUrl}}",
    ].join("\n"),
  },
  "form-submit-alert": {
    subject: "New application received — BMAC",
    html: shell(
      "New application received",
      "<strong>{{submitterName}}</strong> ({{submitterEmail}}) submitted a <strong>{{kindLabel}}</strong> application.",
      { label: "View in Dashboard", url: "{{dashboardUrl}}" }
    ),
    text: [
      "New application received",
      "",
      "{{submitterName}} ({{submitterEmail}}) submitted a {{kindLabel}} application.",
      "",
      "View in dashboard: {{dashboardUrl}}",
    ].join("\n"),
  },
  "admin-reply": {
    subject: "Re: {{originalTitle}}",
    html: shell(
      "{{originalTitle}}",
      "{{body}}",
      undefined,
      "You are receiving this because you contacted BMAC. This email is a direct reply from our team."
    ),
    text: [
      "{{body}}",
      "",
      "—",
      "You are receiving this because you contacted BMAC. This email is a direct reply from our team.",
    ].join("\n"),
  },
  "contact-autoreply": {
    subject: "We received your message — BMAC",
    html: shell(
      "Thanks for reaching out, {{firstName}}!",
      "We've received your message and a member of our team will get back to you within 1–2 business days. If your inquiry is urgent, reply to this email.",
      undefined,
      "This is an automated acknowledgement. No action is needed on your part."
    ),
    text: [
      "Thanks for reaching out, {{firstName}}!",
      "",
      "We've received your message and a member of our team will get back to you within 1–2 business days.",
      "",
      "This is an automated acknowledgement. No action is needed on your part.",
    ].join("\n"),
  },
  "registration-confirmed": {
    subject: "You're registered for {{eventName}} — BMAC",
    html: shell(
      "Registration confirmed",
      "Hi <strong>{{firstName}}</strong>, your registration for <strong>{{eventName}}</strong> is confirmed. We can't wait to see you there!",
      { label: "View Your Pass", url: "{{passUrl}}" },
      "Event date: {{eventDate}} · Location: {{eventLocation}}"
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Your registration for {{eventName}} is confirmed.",
      "Event date: {{eventDate}}",
      "Location: {{eventLocation}}",
      "",
      "View your pass: {{passUrl}}",
    ].join("\n"),
  },
  "ticket-receipt": {
    subject: "Your ticket for {{eventName}} — BMAC",
    html: shell(
      "Here's your ticket",
      "Hi <strong>{{firstName}}</strong>, thanks for getting your ticket for <strong>{{eventName}}</strong>. Your reference is <strong>{{reference}}</strong>. Show the QR code at the door to check in.",
      { label: "View Your Pass", url: "{{passUrl}}" },
      "Need help? Reply to this email and we will sort you out."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Thanks for getting your ticket for {{eventName}}.",
      "Reference: {{reference}}",
      "",
      "View your pass: {{passUrl}}",
      "",
      "Show the QR code at the door to check in.",
    ].join("\n"),
  },
  "application-status": {
    subject: "Update on your BMAC application",
    html: shell(
      "Application status update",
      "Hi <strong>{{firstName}}</strong>, there's an update on your <strong>{{kindLabel}}</strong> application: your status is now <strong>{{status}}</strong>.{{note}}",
      undefined,
      "If you have questions about this update, reply to this email."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "There's an update on your {{kindLabel}} application: your status is now {{status}}.{{note}}",
      "",
      "If you have questions about this update, reply to this email.",
    ].join("\n"),
  },
  "event-reminder": {
    subject: "Reminder: {{eventName}} is coming up — BMAC",
    html: shell(
      "Don't forget {{eventName}}!",
      "Hi <strong>{{firstName}}</strong>, just a friendly reminder that <strong>{{eventName}}</strong> is happening soon. We look forward to seeing you there!",
      { label: "View Your Pass", url: "{{passUrl}}" },
      "Event date: {{eventDate}} · Location: {{eventLocation}}"
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Just a friendly reminder that {{eventName}} is happening soon.",
      "Event date: {{eventDate}}",
      "Location: {{eventLocation}}",
      "",
      "View your pass: {{passUrl}}",
    ].join("\n"),
  },
  "public-credentials": {
    subject: "Your BMAC account credentials",
    html: shell(
      "Welcome to BMAC",
      "Hi <strong>{{firstName}}</strong>, you've been accepted into a BMAC program! Use the credentials below to sign in to your account.",
      { label: "Sign In", url: "{{loginUrl}}" },
      "You'll be asked to change your password on first login."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "You've been accepted into a BMAC program!",
      "",
      "Email: {{email}}",
      "Password: {{password}}",
      "",
      "Sign in at: {{loginUrl}}",
      "",
      "You'll be asked to change your password on first login.",
    ].join("\n"),
  },
  "public-welcome": {
    subject: "Welcome to {{programTitle}} — BMAC",
    html: shell(
      "You're in, {{firstName}}!",
      "Congratulations! You've been accepted into <strong>{{programTitle}}</strong>. Sign in to your BMAC account to access program materials and track your progress.",
      { label: "Go to My Account", url: "{{loginUrl}}" },
      "If you have questions, reply to this email."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Congratulations! You've been accepted into {{programTitle}}.",
      "",
      "Sign in at: {{loginUrl}}",
      "",
      "If you have questions, reply to this email.",
    ].join("\n"),
  },
  "payment-required": {
    subject: "Complete your payment for {{programTitle}} — BMAC",
    html: shell(
      "Congratulations, {{firstName}}!",
      "Your application for <strong>{{programTitle}}</strong> has been accepted! Please complete your payment of <strong>{{amountLabel}}</strong> to secure your spot.",
      { label: "Complete Payment", url: "{{paymentLink}}" },
      "Reference: <strong>{{reference}}</strong>. If you have questions, reply to this email."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Your application for {{programTitle}} has been accepted!",
      "",
      "Please complete your payment of {{amountLabel}} to secure your spot:",
      "",
      "{{paymentLink}}",
      "",
      "Reference: {{reference}}",
      "",
      "If you have questions, reply to this email.",
    ].join("\n"),
  },
  "payment-verified": {
    subject: "Your payment is confirmed — {{eventName}}",
    html: shell(
      "Payment confirmed",
      "Hi <strong>{{firstName}}</strong>, we're sorry for the delay — your payment for <strong>{{eventName}}</strong> has been verified. Below is your event pass.",
      { label: "View Your Pass", url: "{{passUrl}}" },
      "Event date: {{eventDate}} · Location: {{eventLocation}} · Reference: {{reference}}. We apologise for the inconvenience."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "We're sorry for the delay — your payment for {{eventName}} has been verified.",
      "",
      "Event date: {{eventDate}}",
      "Location: {{eventLocation}}",
      "Reference: {{reference}}",
      "",
      "View your pass: {{passUrl}}",
      "",
      "We apologise for the inconvenience.",
    ].join("\n"),
  },
};

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "credentials",
  "password-reset",
  "admin-deleted",
  "admin-delete-attempt",
  "application-received",
  "donation-thanks",
  "donation-alert",
  "form-submit-alert",
  "admin-reply",
  "contact-autoreply",
  "registration-confirmed",
  "ticket-receipt",
  "application-status",
  "event-reminder",
  "public-credentials",
  "public-welcome",
  "payment-required",
  "payment-verified",
];
