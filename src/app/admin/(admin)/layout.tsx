import AdminLayout from "@/components/admin/AdminLayout";
import { getSuperAdminSession, ALL_PERMISSIONS } from "@/lib/auth/super-admin";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await getSuperAdminSession();
  } catch (e) {
    console.error("admin layout session error:", e);
  }

  if (!session) return <>{children}</>;

  return (
    <AdminLayout
      user={{
        email: session.email,
        firstName: session.firstName || session.email.split("@")[0],
        role: session.role,
        permissions: session.role === "super_admin" ? ALL_PERMISSIONS : session.permissions,
      }}
    >
      {children}
    </AdminLayout>
  );
}
