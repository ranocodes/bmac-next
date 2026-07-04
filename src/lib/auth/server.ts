import { getSuperAdminSession } from "@/lib/auth/super-admin";
import type { Permission } from "@/types/cms";

export const auth = {
  getSession: async () => {
    const session = await getSuperAdminSession();
    if (!session) return { data: null, error: null };
    return {
      data: {
        session: {},
        user: {
          id: `super-${session.email}`,
          email: session.email,
          name: session.email.split("@")[0],
        },
      },
      error: null,
    };
  },
};

export async function requireAuth() {
  const session = await getSuperAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session.email;
}

export async function requireAdmin() {
  const session = await getSuperAdminSession();
  if (!session) throw new Error("Unauthorized");

  const email = session.email;
  return {
    email,
    userId: `super-${email}`,
    adminId: `super-${email}`,
    permissions: [
      "manage_users", "edit_content", "manage_courses", "manage_partners",
      "view_analytics", "access_settings", "delete_records", "manage_moderators",
    ] as Permission[],
  };
}

export async function requirePermission(permission: Permission) {
  const admin = await requireAdmin();
  if (!admin.permissions?.includes(permission)) throw new Error("Forbidden: insufficient permissions");
  return admin;
}
