import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";
import { getUserRole } from "@/lib/role-detect";
import { Heart, ArrowRight, Calendar, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface VolunteerRecord {
  kind: string;
  status: string;
  ref_title: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLE[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function VolunteerDashboardPage() {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const emailRows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = emailRows[0]?.email || session.email;

  const userRole = await getUserRole(email);
  if (!userRole?.isVolunteer) {
    redirect("/dashboard");
  }

  const volunteerRecords = await db.query<VolunteerRecord>(
    `SELECT kind, status, ref_title, created_at
     FROM person_records pr
     JOIN people p ON p.id = pr.person_id
     WHERE LOWER(p.email) = LOWER($1) AND kind = 'volunteer'
     ORDER BY pr.created_at DESC`,
    [email]
  );

  const activeRecord = volunteerRecords.find(r => r.status === "active");
  const pendingRecord = volunteerRecords.find(r => r.status === "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary">Volunteer Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your volunteer activities and track your contributions.
        </p>
      </div>

      {/* Status Card */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
          <Heart className="h-4 w-4 text-emerald-600" />
          Your Status
        </h2>
        {volunteerRecords.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-secondary mt-2">Not yet a volunteer</p>
            <p className="text-xs text-muted-foreground mt-1">Apply as a volunteer to join our team.</p>
            <Link href="/get-involved" className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline">
              Apply now <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {volunteerRecords.map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-4 rounded-lg bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary">{v.ref_title || "Volunteer"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Since {formatDate(v.created_at)}
                  </p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          Quick Actions
        </h2>
        <div className="space-y-2">
          <Link
            href="/get-involved"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted transition-colors"
          >
            <Heart className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-secondary">Apply for Programs</p>
              <p className="text-xs text-muted-foreground">Browse and apply to volunteer opportunities</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </Link>
          <Link
            href="/events"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted transition-colors"
          >
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-secondary">View Events</p>
              <p className="text-xs text-muted-foreground">See upcoming events you can volunteer at</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          </Link>
        </div>
      </section>
    </div>
  );
}
