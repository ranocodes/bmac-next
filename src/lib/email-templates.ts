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
  | "google-forms-link"
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
  | "welcome-step-1"
  | "welcome-step-2"
  | "welcome-step-3"
  | "renewal-reminder-30"
  | "renewal-reminder-7"
  | "renewal-reminder-1"
  | "re-engagement-30"
  | "re-engagement-60";

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  credentials: "Admin credentials",
  "password-reset": "Password reset",
  "admin-deleted": "Admin account deleted",
  "admin-delete-attempt": "Self-deletion blocked",
  "google-forms-link": "Application form link",
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
  "welcome-step-1": "Welcome — Day 0",
  "welcome-step-2": "Getting started — Day 3",
  "welcome-step-3": "Your journey continues — Day 7",
  "renewal-reminder-30": "Membership renews in 30 days",
  "renewal-reminder-7": "Membership renews in 7 days",
  "renewal-reminder-1": "Membership renews tomorrow",
  "re-engagement-30": "We miss you — 30 days",
  "re-engagement-60": "We miss you — 60 days",
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
  "google-forms-link": {
    subject: "Your BMAC application — next step",
    html: shell(
      "Welcome, {{firstName}}!",
      "Your <strong>{{kindLabel}}</strong> application has been received. Please complete the next step by filling out this short form — it helps us understand you better and keeps your application on track.",
      { label: "Continue Application", url: "{{formLink}}" },
      "Your application link is unique to you. If you did not apply, you can ignore this email."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Your {{kindLabel}} application has been received. Please complete the next step by filling out this short form:",
      "",
      "{{formLink}}",
      "",
      "This link is unique to you. If you did not apply, you can ignore this email.",
    ].join("\n"),
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
  "welcome-step-1": {
    subject: "Welcome to BMAC, {{firstName}}!",
    html: shell(
      "Welcome to BMAC!",
      "Hi <strong>{{firstName}}</strong>, thank you for joining the Brilliant Minds Ambassadors Club! We're excited to have you. Here's what to do first:",
      { label: "Sign In to Your Account", url: "{{loginUrl}}" },
      "You'll be prompted to change your password on first login."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Thank you for joining BMAC! We're excited to have you.",
      "",
      "Sign in at: {{loginUrl}}",
      "You'll be prompted to change your password on first login.",
    ].join("\n"),
  },
  "welcome-step-2": {
    subject: "Getting started at BMAC",
    html: shell(
      "Getting started at BMAC",
      "Hi <strong>{{firstName}}</strong>, now that you've joined BMAC, here are some tips to get the most out of your experience:",
      undefined,
      "Check your dashboard regularly for updates on programs, events, and volunteer opportunities."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Now that you've joined BMAC, here are some tips:",
      "",
      "- Check your dashboard for programs and events",
      "- Complete your profile for a personalized experience",
      "- Look out for volunteer opportunities",
    ].join("\n"),
  },
  "welcome-step-3": {
    subject: "Your BMAC journey continues",
    html: shell(
      "Your BMAC journey continues",
      "Hi <strong>{{firstName}}</strong>, you've been with BMAC for a week now! We hope you're settling in. Explore our upcoming events and programs to make the most of your membership.",
      { label: "Explore Programs", url: "{{loginUrl}}" },
      "Questions? Reply to this email — we're here to help."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "You've been with BMAC for a week now! Explore our upcoming events and programs.",
      "",
      "Sign in at: {{loginUrl}}",
      "Questions? Reply to this email.",
    ].join("\n"),
  },
  "renewal-reminder-30": {
    subject: "Your BMAC membership renews in 30 days",
    html: shell(
      "Membership renewal",
      "Hi <strong>{{firstName}}</strong>, your BMAC membership renews on <strong>{{renewalDate}}</strong>. Make sure your profile and payment details are up to date.",
      undefined,
      "If you have questions about renewal, reply to this email."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Your BMAC membership renews on {{renewalDate}}.",
      "Make sure your profile and payment details are up to date.",
      "",
      "Questions? Reply to this email.",
    ].join("\n"),
  },
  "renewal-reminder-7": {
    subject: "BMAC membership renews in 7 days",
    html: shell(
      "Renewal in 7 days",
      "Hi <strong>{{firstName}}</strong>, your BMAC membership renews in <strong>7 days</strong> on {{renewalDate}}. Please ensure your details are current.",
      undefined,
      "Contact us if you need to make changes before renewal."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Your BMAC membership renews in 7 days on {{renewalDate}}.",
      "Please ensure your details are current.",
    ].join("\n"),
  },
  "renewal-reminder-1": {
    subject: "BMAC membership renews tomorrow",
    html: shell(
      "Renewal tomorrow",
      "Hi <strong>{{firstName}}</strong>, your BMAC membership renews <strong>tomorrow</strong> on {{renewalDate}}. No action needed if your details are up to date.",
      undefined,
      "Reply to this email if you have any questions."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "Your BMAC membership renews tomorrow on {{renewalDate}}.",
      "No action needed if your details are up to date.",
    ].join("\n"),
  },
  "re-engagement-30": {
    subject: "We miss you at BMAC, {{firstName}}!",
    html: shell(
      "We miss you!",
      "Hi <strong>{{firstName}}</strong>, it's been a while since you logged in to BMAC. We'd love to see you back! There are exciting programs and events happening.",
      { label: "Sign Back In", url: "{{loginUrl}}" },
      "If you no longer wish to receive these emails, you can unsubscribe from your account settings."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "It's been a while since you logged in to BMAC. We'd love to see you back!",
      "",
      "Sign in at: {{loginUrl}}",
    ].join("\n"),
  },
  "re-engagement-60": {
    subject: "Still thinking about BMAC?",
    html: shell(
      "We're still here",
      "Hi <strong>{{firstName}}</strong>, we haven't seen you in a while. BMAC is always growing — new programs, new opportunities, and new people. We'd love to welcome you back.",
      { label: "Return to BMAC", url: "{{loginUrl}}" },
      "If you no longer wish to receive these emails, you can unsubscribe from your account settings."
    ),
    text: [
      "Hi {{firstName}},",
      "",
      "We haven't seen you in a while. BMAC is always growing.",
      "",
      "Sign in at: {{loginUrl}}",
    ].join("\n"),
  },
};

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "credentials",
  "password-reset",
  "admin-deleted",
  "admin-delete-attempt",
  "google-forms-link",
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
  "welcome-step-1",
  "welcome-step-2",
  "welcome-step-3",
  "renewal-reminder-30",
  "renewal-reminder-7",
  "renewal-reminder-1",
  "re-engagement-30",
  "re-engagement-60",
];
