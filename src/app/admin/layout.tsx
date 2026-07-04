import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getSuperAdminSession } from "@/lib/auth/super-admin";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSuperAdminSession();

  if (!session) redirect("/admin/login");

  return (
    <AdminLayout
      user={{
        email: session.email,
        firstName: session.email.split("@")[0],
        role: "super_admin",
        permissions: [
          "manage_users", "edit_content", "manage_courses", "manage_partners",
          "view_analytics", "access_settings", "delete_records", "manage_moderators",
        ],
      }}
    >
      {children}
    </AdminLayout>
  );
}
