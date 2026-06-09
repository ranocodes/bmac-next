import { getItem } from "@/data/store";
import type { Permission } from "@/types/cms";

export function requirePermission(email: string | null | undefined, permission: Permission): boolean {
  if (!email) return false;
  const users = getItem<Array<{ email: string; permissions: Permission[] }>>("admin_users") || [];
  const user = users.find(u => u.email === email);
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function getSessionUser(): { email: string; firstName?: string } | null {
  return getItem<{ email: string; firstName?: string }>("session");
}

export function getCurrentUserPermissions(): Permission[] {
  const session = getSessionUser();
  if (!session) return [];
  const users = getItem<Array<{ email: string; permissions: Permission[]; role: string }>>("admin_users") || [];
  const user = users.find(u => u.email === session.email);
  return user?.permissions || [];
}

export function getCurrentUserRole(): string {
  const session = getSessionUser();
  if (!session) return "";
  const users = getItem<Array<{ email: string; role: string }>>("admin_users") || [];
  const user = users.find(u => u.email === session.email);
  return user?.role || "";
}
