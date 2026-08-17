import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const rows = await db.query<{ must_change_password: boolean }>(
    `SELECT must_change_password FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );

  if (rows.length && rows[0].must_change_password) {
    redirect("/account/password");
  }

  return <>{children}</>;
}
