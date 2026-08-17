import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";
import { getUserRole } from "@/lib/role-detect";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const rows = await db.query<{ must_change_password: boolean }>(
    `SELECT must_change_password FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );

  if (rows.length && rows[0].must_change_password) {
    redirect("/account/password");
  }

  const emailRows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = emailRows[0]?.email || session.email;

  const userRole = await getUserRole(email);
  if (!userRole || userRole.primaryRole === "none") {
    redirect("/account");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={userRole} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
