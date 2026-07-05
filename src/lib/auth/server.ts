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
          name: session.firstName || session.email.split("@")[0],
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

  return {
    email: session.email,
    firstName: session.firstName,
    userId: `super-${session.email}`,
    adminId: `super-${session.email}`,
    role: session.role,
    permissions: session.permissions,
  };
}

export async function requirePermission(permission: Permission) {
  const admin = await requireAdmin();
  if (!admin.permissions?.includes(permission)) throw new Error("Forbidden: insufficient permissions");
  return admin;
}
