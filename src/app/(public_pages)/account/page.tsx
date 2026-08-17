import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";
import { LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const rows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = rows[0]?.email || session.email;

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">My BMAC<span className="text-primary">.</span></h1>
          <p className="text-sm text-muted-foreground mt-2">{email}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-input bg-card p-6">
            <h2 className="text-sm font-semibold text-secondary mb-1">Programs</h2>
            <p className="text-sm text-muted-foreground">Coming soon — your enrolled programs and progress will appear here.</p>
          </div>
          <div className="rounded-2xl border border-input bg-card p-6">
            <h2 className="text-sm font-semibold text-secondary mb-1">Attendance</h2>
            <p className="text-sm text-muted-foreground">Coming soon — your session attendance will be tracked here.</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
