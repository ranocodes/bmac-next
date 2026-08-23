"use server";

import { db } from "@/lib/db";
import { requireAdmin, requirePermission } from "@/lib/auth/server";
import { getSuperAdminSession, setSuperAdminSession } from "@/lib/auth/super-admin";
import type { SiteSettings } from "@/types/cms";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_KEYS,
  type EmailTemplate,
} from "@/lib/email-templates";
import { logActivity } from "@/lib/activity-log";

export interface SiteSettingsRow extends SiteSettings {
  email_templates?: Record<string, Partial<EmailTemplate>>;
}

export async function getSiteSettings() {
  await requireAdmin();
  const rows = await db.getAll<SiteSettingsRow>("site_settings").catch(() => []);
  return rows.length > 0 ? rows[0] : null;
}

export async function saveSiteSettings(data: Record<string, unknown>) {
  await requirePermission("access_settings");
  const existing = await db.getAll<SiteSettingsRow>("site_settings").catch(() => []);
  if (existing.length > 0) {
    return db.update("site_settings", existing[0].id, data);
  }
  return db.create("site_settings", { id: `settings-${Date.now()}`, ...data });
}

export async function getEmailTemplates(): Promise<Record<string, EmailTemplate>> {
  await requireAdmin();
  const settings = await getSiteSettings();
  const stored = (settings?.email_templates as Record<string, Partial<EmailTemplate>> | undefined) || {};
  const out: Record<string, EmailTemplate> = {};
  for (const key of EMAIL_TEMPLATE_KEYS) {
    const fallback = DEFAULT_EMAIL_TEMPLATES[key];
    const saved = stored[key];
    out[key] = {
      subject: saved?.subject || fallback.subject,
      html: saved?.html || fallback.html,
      text: saved?.text || fallback.text,
    };
  }
  return out;
}

export async function saveEmailTemplates(
  templates: Record<string, EmailTemplate>
): Promise<{ error?: string }> {
  await requirePermission("access_settings");
  const clean: Record<string, EmailTemplate> = {};
  for (const key of EMAIL_TEMPLATE_KEYS) {
    const tpl = templates[key];
    if (!tpl) continue;
    clean[key] = {
      subject: (tpl.subject || "").trim(),
      html: tpl.html || "",
      text: tpl.text || "",
    };
  }
  const settings = await getSiteSettings();
  if (settings) {
    await db.update("site_settings", settings.id, { email_templates: clean });
  } else {
    await db.create("site_settings", { id: `settings-${Date.now()}`, email_templates: clean });
  }
  try { await logActivity("admin", "settings_email_templates_update", "settings"); } catch {}
  return {};
}

export async function resetEmailTemplate(key: string): Promise<{ error?: string }> {
  await requirePermission("access_settings");
  if (!(EMAIL_TEMPLATE_KEYS as string[]).includes(key)) {
    return { error: "Unknown template" };
  }
  const settings = await getSiteSettings();
  const stored = (settings?.email_templates as Record<string, Partial<EmailTemplate>> | undefined) || {};
  const next: Record<string, Partial<EmailTemplate>> = { ...stored };
  delete next[key];
  if (settings) {
    await db.update("site_settings", settings.id, { email_templates: next });
  } else {
    await db.create("site_settings", { id: `settings-${Date.now()}`, email_templates: next });
  }
  try { await logActivity("admin", "settings_email_template_reset", "settings", { details: key }); } catch {}
  return {};
}

export async function getGoogleForms(): Promise<Record<string, string>> {
  try {
    const rows = await db.getAll<{ google_forms?: Record<string, string> }>("site_settings").catch(() => []);
    return rows.length > 0 ? (rows[0].google_forms as Record<string, string>) || {} : {};
  } catch {
    return {};
  }
}

export async function updateAdminProfile(email: string, firstName: string) {
  await requireAdmin();
  const session = await getSuperAdminSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await db.query(
      "UPDATE public.super_admins SET first_name = $1 WHERE email = $2",
      [firstName, email]);
  } catch { /* may not exist yet — ok */ }

  const users = await db.query<{ id: string }>(
    "SELECT id FROM public.admin_users WHERE email = $1", [email]);
  if (users.length > 0) {
    await db.update("admin_users", users[0].id, { first_name: firstName });
  }

  await setSuperAdminSession(email, firstName, session.permissions, session.role);
  return { success: true };
}
