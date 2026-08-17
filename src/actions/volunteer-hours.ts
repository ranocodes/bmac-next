"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin, requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";

export interface VolunteerHoursRecord {
  id: string;
  person_id: string;
  hours: number;
  description: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerSummary {
  total_hours: number;
  pending_hours: number;
  approved_hours: number;
  by_activity: { description: string; hours: number; count: number }[];
}

export async function logVolunteerHours(input: {
  personId: string;
  hours: number;
  description: string;
  date: string;
}): Promise<{ success: boolean; error?: string; record?: VolunteerHoursRecord }> {
  try {
    if (!input.personId) return { success: false, error: "Person ID required" };
    if (!input.hours || input.hours <= 0) return { success: false, error: "Hours must be positive" };
    if (!input.description?.trim()) return { success: false, error: "Description required" };
    if (!input.date) return { success: false, error: "Date required" };

    const id = `vh-${crypto.randomUUID()}`;
    const record = await db.create("volunteer_hours", {
      id,
      person_id: input.personId,
      hours: input.hours,
      description: input.description.trim().slice(0, 500),
      date: input.date,
      status: "pending",
      approved_by: null,
    }) as VolunteerHoursRecord;

    await logActivity("system", "volunteer_hours_log", "volunteer_hours", {
      resourceId: id,
      details: `Logged ${input.hours}h: ${input.description.trim().slice(0, 100)}`,
    });

    return { success: true, record };
  } catch (err) {
    console.error("logVolunteerHours error:", err);
    return { success: false, error: "Failed to log hours" };
  }
}

export async function getVolunteerHours(personId: string): Promise<VolunteerHoursRecord[]> {
  try {
    return await db.query<VolunteerHoursRecord>(
      `SELECT * FROM public.volunteer_hours WHERE person_id = $1 ORDER BY date DESC, created_at DESC`,
      [personId]
    );
  } catch (err) {
    console.error("getVolunteerHours error:", err);
    return [];
  }
}

export async function getAllVolunteerHours(): Promise<(VolunteerHoursRecord & { first_name: string; last_name: string; email: string })[]> {
  await requirePermission("manage_people");
  try {
    return await db.query(
      `SELECT vh.*, p.first_name, p.last_name, p.email
       FROM public.volunteer_hours vh
       JOIN people p ON p.id = vh.person_id
       ORDER BY vh.created_at DESC`
    );
  } catch (err) {
    console.error("getAllVolunteerHours error:", err);
    return [];
  }
}

export async function approveVolunteerHours(input: {
  hoursId: string;
  approvedBy: string;
  action: "approve" | "reject";
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const status = input.action === "approve" ? "approved" : "rejected";
    const rows = await db.query<VolunteerHoursRecord>(
      `UPDATE public.volunteer_hours
       SET status = $2, approved_by = $3, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [input.hoursId, status, input.approvedBy]
    );
    if (!rows.length) return { success: false, error: "Record not found" };

    await logActivity(input.approvedBy, `volunteer_hours_${status}`, "volunteer_hours", {
      resourceId: input.hoursId,
      details: `Hours ${status} by ${input.approvedBy}`,
    });

    return { success: true };
  } catch (err) {
    console.error("approveVolunteerHours error:", err);
    return { success: false, error: "Failed to update hours" };
  }
}

export async function getVolunteerSummary(personId: string): Promise<VolunteerSummary> {
  try {
    const rows = await db.query<{ total: number; pending: number; approved: number }>(
      `SELECT
         COALESCE(SUM(hours), 0)::int AS total,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN hours ELSE 0 END), 0)::int AS pending,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN hours ELSE 0 END), 0)::int AS approved
       FROM public.volunteer_hours
       WHERE person_id = $1`,
      [personId]
    );

    const byActivity = await db.query<{ description: string; hours: number; count: number }>(
      `SELECT description, SUM(hours)::int AS hours, COUNT(*)::int AS count
       FROM public.volunteer_hours
       WHERE person_id = $1 AND status = 'approved'
       GROUP BY description
       ORDER BY hours DESC`,
      [personId]
    );

    return {
      total_hours: Number(rows[0]?.total ?? 0),
      pending_hours: Number(rows[0]?.pending ?? 0),
      approved_hours: Number(rows[0]?.approved ?? 0),
      by_activity: byActivity.map((r) => ({
        description: r.description,
        hours: Number(r.hours),
        count: Number(r.count),
      })),
    };
  } catch (err) {
    console.error("getVolunteerSummary error:", err);
    return { total_hours: 0, pending_hours: 0, approved_hours: 0, by_activity: [] };
  }
}
