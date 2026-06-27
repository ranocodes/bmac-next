import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
    first_name: firstName,
    role: "super_admin",
    permissions,
  });

  return { id, email, first_name: firstName, role: "super_admin", permissions };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/admin/login");

  let user;
  try {
    user = await currentUser();
  } catch (e) {
    console.error("Clerk currentUser() failed:", e);
    return <AdminLayout error="Authentication service unavailable. Please try signing in again.">{children}</AdminLayout>;
  }

  let adminUser = null;

  if (user) {
    const email = user.primaryEmailAddress?.emailAddress;
    const firstName = user.firstName || (email ? email.split("@")[0] : "");
    if (email) {
      adminUser = await getAdminUser(email);
      if (!adminUser) {
        const firstAdminEmail = process.env.FIRST_ADMIN_EMAIL;
        if (firstAdminEmail && email === firstAdminEmail) {
          const existing = await db.query<any>("SELECT COUNT(*)::int AS count FROM public.admin_users");
          const count = existing[0]?.count ?? 0;
          if (count === 0) {
            adminUser = await createDefaultAdmin(email, firstName);
          }
        }
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

  if (user) {
    const clerkEmail = user.primaryEmailAddress?.emailAddress || "unknown";
    return (
      <AdminLayout
        user={{ email: clerkEmail, firstName: user.firstName || "", role: "", permissions: [] }}
        error={`Access denied. Signed in as ${clerkEmail} — not registered as an admin.`}
      >
        {children}
      </AdminLayout>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
