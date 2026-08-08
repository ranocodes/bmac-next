import crypto from "crypto";
import { db } from "@/lib/db";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

function rowToNotification(row: NotificationRow): AdminNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message || "",
    type: row.type || "info",
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function getSuperAdminEmails(): Promise<string[]> {
  try {
    const rows = await db.query<{ email: string }>(
      "SELECT email FROM public.admin_users WHERE role = 'super_admin' AND email IS NOT NULL AND email <> ''"
    );
    return rows.map(r => r.email).filter(Boolean);
  } catch (err) {
    console.error("getSuperAdminEmails error:", err);
    return [];
  }
}

export async function createAdminNotification(input: {
  title: string;
  message?: string;
  type?: string;
}): Promise<void> {
  try {
    await db.create("admin_notifications", {
      id: `ntf-${crypto.randomUUID()}`,
      title: input.title,
      message: input.message || "",
      type: input.type || "info",
      read: false,
    });
  } catch (err) {
    console.error("createAdminNotification error:", err);
  }
}

export async function listNotifications(limit = 20): Promise<AdminNotification[]> {
  const rows = await db.query<NotificationRow>(
    "SELECT * FROM public.admin_notifications ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return rows.map(rowToNotification);
}

export async function unreadNotificationsCount(): Promise<number> {
  const rows = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM public.admin_notifications WHERE read = FALSE"
  );
  return Number(rows[0]?.count ?? 0);
}

export async function markAllNotificationsRead(): Promise<void> {
  await db.query("UPDATE public.admin_notifications SET read = TRUE WHERE read = FALSE");
}

export async function markNotificationRead(id: string): Promise<void> {
  await db.query("UPDATE public.admin_notifications SET read = TRUE WHERE id = $1", [id]);
}
