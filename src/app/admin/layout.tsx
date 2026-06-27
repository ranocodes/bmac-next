import { currentUser, clerkClient } from "@clerk/nextjs/server";
import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAdminUser(email: string) {
  const users = await db.query<any>(
    "SELECT id, email, first_name, role, permissions FROM public.admin_users WHERE email = $1",
    [email]
  );
  return users.length > 0 ? users[0] : null;
}

async function createDefaultAdmin(email: string, firstName: string) {
  const id = `admin-${Date.now()}`;
  const permissions = [
    "manage_users", "edit_content", "manage_courses", "manage_partners",
    "view_analytics", "access_settings", "delete_records", "manage_moderators",
  ];
  await db.create("admin_users", {
    id,
    email,
    password: "",
    first_name: firstName,
    role: "super_admin",
    permissions,
  });

  return { id, email, first_name: firstName, role: "super_admin", permissions };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  let adminUser = null;

  if (user) {
    const email = user.primaryEmailAddress?.emailAddress;
    const firstName = user.firstName || (email ? email.split("@")[0] : "");
    if (email) {
      adminUser = await getAdminUser(email);
      if (!adminUser) {
        const existing = await db.query<any>("SELECT COUNT(*)::int AS count FROM public.admin_users");
        const count = existing[0]?.count ?? 0;
        if (count === 0) {
          adminUser = await createDefaultAdmin(email, firstName);
        }
      }
    }
  }

  if (adminUser) {
    // Ensure Clerk allowlist restriction is active
    try {
      const client = await clerkClient();
      await client.instance.updateRestrictions({ allowlist: true });
    } catch (e) {
      console.warn("Failed to set Clerk allowlist restriction:", e);
    }
    return (
      <AdminLayout
        user={{
          email: adminUser.email,
          firstName: adminUser.first_name,
          role: adminUser.role,
          permissions: adminUser.permissions || [],
        }}
      >
        {children}
      </AdminLayout>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
