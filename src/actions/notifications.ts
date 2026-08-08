"use server";

import { requireAdmin } from "@/lib/auth/server";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationsCount,
  type AdminNotification,
} from "@/lib/notifications";

export async function getNotifications(
  limit = 20
): Promise<{ items: AdminNotification[]; unread: number }> {
  await requireAdmin();
  const [items, unread] = await Promise.all([listNotifications(limit), unreadNotificationsCount()]);
  return { items, unread };
}

export async function markNotificationsRead(ids?: string[]): Promise<{ success: boolean }> {
  await requireAdmin();
  if (ids && ids.length) {
    for (const id of ids) await markNotificationRead(id);
  } else {
    await markAllNotificationsRead();
  }
  return { success: true };
}
