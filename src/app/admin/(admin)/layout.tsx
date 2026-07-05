import AdminLayout from "@/components/admin/AdminLayout";
import { getSuperAdminSession } from "@/lib/auth/super-admin";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSuperAdminSession();

  if (!session) return <>{children}</>;

  return (
    <AdminLayout
      user={{
        email: session.email,
        firstName: session.firstName || session.email.split("@")[0],
        role: session.role,
        permissions: session.permissions,
      }}
    >
      {children}
    </AdminLayout>
  );
}
