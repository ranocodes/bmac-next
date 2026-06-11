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

  // Restrict future sign-ups to invited users only
  try {
    const client = await clerkClient();
    await client.instance.updateRestrictions({ allowlist: true });
  } catch (e) {
    console.warn("Failed to set Clerk allowlist restriction:", e);
  }
  return { id, email, first_name: firstName, role: "super_admin", permissions };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  let adminUser = null;

  if (user) {
    const email = user.primaryEmailAddress?.emailAddress;
    const firstName = user.firstName || "";
    if (email) {
      adminUser = await getAdminUser(email);
      if (!adminUser) {
        adminUser = await createDefaultAdmin(email, firstName);
      }
    }
  }

  if (adminUser) {
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
