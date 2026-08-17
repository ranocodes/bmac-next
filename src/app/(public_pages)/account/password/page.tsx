import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";
import PasswordChangeForm from "./PasswordChangeForm";

export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const rows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = rows[0]?.email || session.email;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Change Password</h1>
          <p className="text-sm text-muted-foreground mt-2">Set a new password for <strong>{email}</strong></p>
        </div>
        <PasswordChangeForm />
      </div>
    </div>
  );
}
