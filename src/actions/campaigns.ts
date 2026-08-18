"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import { logActivity } from "@/actions/activity-logs";
import { sendNewsletterBroadcastEmail } from "@/lib/email";

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  html_body: string;
  text_body: string;
  target_audience: string;
  recipient_count: number;
  status: "draft" | "sent";
  sent_at: string | null;
  created_at: string;
  created_by: string | null;
}

export async function listCampaigns(): Promise<{ campaigns?: EmailCampaign[]; error?: string }> {
  try {
    await requireAdmin();
    const rows = await db.query<EmailCampaign>(
      `SELECT id, title, subject, html_body, text_body, target_audience, recipient_count, status, sent_at, created_at, created_by
       FROM public.email_campaigns ORDER BY created_at DESC`
    );
    return { campaigns: rows };
  } catch (err) {
    console.error("listCampaigns error:", err);
    return { error: "Failed to load campaigns" };
  }
}

export async function getCampaign(id: string): Promise<{ campaign?: EmailCampaign; error?: string }> {
  try {
    await requireAdmin();
    const row = await db.getById<EmailCampaign>("email_campaigns", id);
    if (!row) return { error: "Campaign not found" };
    return { campaign: row };
  } catch (err) {
    console.error("getCampaign error:", err);
    return { error: "Failed to load campaign" };
  }
}

export async function saveCampaign(input: {
  id?: string;
  title: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  targetAudience: string;
}): Promise<{ id?: string; error?: string }> {
  try {
    const admin = await requireAdmin();
    const id = input.id || `cmp-${crypto.randomUUID()}`;
    const data = {
      title: input.title,
      subject: input.subject,
      html_body: input.htmlBody,
      text_body: input.textBody || "",
      target_audience: input.targetAudience,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      await db.update("email_campaigns", input.id, data);
    } else {
      await db.create("email_campaigns", {
        id,
        ...data,
        status: "draft",
        recipient_count: 0,
        created_by: admin.email || "admin",
        created_at: new Date().toISOString(),
      });
    }

    await logActivity(admin.email || "admin", "campaign_save", "email_campaigns", {
      resourceId: id,
      details: `Campaign "${input.title}" ${input.id ? "updated" : "created"}`,
    });

    return { id };
  } catch (err) {
    console.error("saveCampaign error:", err);
    return { error: "Failed to save campaign" };
  }
}

export async function sendCampaign(id: string): Promise<{ sent?: number; error?: string }> {
  try {
    const admin = await requireAdmin();
    const campaign = await db.getById<EmailCampaign>("email_campaigns", id);
    if (!campaign) return { error: "Campaign not found" };
    if (campaign.status === "sent") return { error: "Campaign already sent" };

    const audienceFilter = campaign.target_audience === "all"
      ? ""
      : campaign.target_audience === "members"
      ? `AND p.roles ? 'member'`
      : campaign.target_audience === "volunteers"
      ? `AND p.roles ? 'volunteer'`
      : campaign.target_audience === "applicants"
      ? `AND p.roles ? 'applicant'`
      : "";

    const rows = await db.query<{ email: string; first_name: string }>(
      `SELECT DISTINCT LOWER(p.email) AS email, p.first_name
       FROM public.people p
       WHERE p.email IS NOT NULL AND p.email != ''
       ${audienceFilter}
       ORDER BY p.email`
    );

    let sent = 0;
    for (const row of rows) {
      const result = await sendNewsletterBroadcastEmail({
        email: row.email,
        firstName: row.first_name,
        subject: campaign.subject,
        body: campaign.text_body || campaign.subject,
        bodyHtml: campaign.html_body,
      });
      if (!result.error) sent++;
    }

    await db.update("email_campaigns", id, {
      status: "sent",
      recipient_count: sent,
      sent_at: new Date().toISOString(),
    });

    await logActivity(admin.email || "admin", "campaign_send", "email_campaigns", {
      resourceId: id,
      details: `Campaign "${campaign.title}" sent to ${sent} recipients`,
    });

    return { sent };
  } catch (err) {
    console.error("sendCampaign error:", err);
    return { error: "Failed to send campaign" };
  }
}

export async function deleteCampaign(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin();
    await db.remove("email_campaigns", id);
    return { success: true };
  } catch (err) {
    console.error("deleteCampaign error:", err);
    return { error: "Failed to delete campaign" };
  }
}
