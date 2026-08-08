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
  | "donation-thanks"
  | "donation-alert"
  | "form-submit-alert";

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  credentials: "Admin credentials",
  "password-reset": "Password reset",
  "admin-deleted": "Admin account deleted",
  "admin-delete-attempt": "Self-deletion blocked",
  "google-forms-link": "Application form link",
  "donation-thanks": "Donation thank-you",
  "donation-alert": "Donation alert (admins)",
  "form-submit-alert": "Application alert (admins)",
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
      "The super admin account <strong>{{deletedAdmin}}</strong> was deleted by {{deletedBy}}. If you did not expect this, review your admin accounts.",
      { label: "Go to Admin Panel", url: "{{loginLink}}" }
    ),
    text: "The super admin account {{deletedAdmin}} was deleted by {{deletedBy}}. If you did not expect this, review your admin accounts.\n\nSign in at: {{loginLink}}",
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
};

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "credentials",
  "password-reset",
  "admin-deleted",
  "admin-delete-attempt",
  "google-forms-link",
  "donation-thanks",
  "donation-alert",
  "form-submit-alert",
];
