import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Permission } from "@/types/cms";

export const auth = {
  getSession: async () => {
    const user = await currentUser();
    if (!user) return { data: null, error: null };
    return {
      data: {
        session: {},
        user: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        },
      },
      error: null,
    };
  },
};

export async function requireAuth() {
  const session = await clerkAuth();
  const userId = session?.userId;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function requireAdmin() {
  await requireAuth();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) throw new Error("No email on account");
  const rows = await db.query<any>(
    "SELECT id, permissions FROM public.admin_users WHERE email = $1",
    [email]
  );
  if (rows.length === 0) throw new Error("Forbidden: not an admin");
  return { email, userId: user.id, adminId: rows[0].id, permissions: rows[0].permissions as Permission[] };
}

export async function requirePermission(permission: Permission) {
  const admin = await requireAdmin();
  if (!admin.permissions?.includes(permission)) throw new Error("Forbidden: insufficient permissions");
  return admin;
}

export { clerkAuth, currentUser };
