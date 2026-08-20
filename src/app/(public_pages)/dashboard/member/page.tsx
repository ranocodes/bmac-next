import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";
import { getUserRole } from "@/lib/role-detect";
import {
  FileText,
  Users,
  CalendarCheck,
  Award,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ApplicationRow {
  id: string;
  status: string;
  created_at: string;
  program_title: string;
}

interface CohortRow {
  cohort_title: string;
  start_date: string;
  end_date: string;
  participant_status: string;
  participant_id: string;
}

interface AttendanceRow {
  session_date: string;
  present: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-amber-100 text-amber-700",
  withdrawn: "bg-gray-100 text-gray-600",
  enrolled: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  dropped: "bg-red-100 text-red-700",
  certificate_eligible: "bg-purple-100 text-purple-700",
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

export default async function MemberDashboardPage() {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const emailRows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = emailRows[0]?.email || session.email;

  const userRole = await getUserRole(email);
  if (!userRole?.isMember) {
    redirect("/dashboard");
  }

  const [applications, cohorts, attendance] = await Promise.all([
    db.query<ApplicationRow>(
      `SELECT pa.id, pa.status, pa.created_at, pr.title AS program_title
       FROM program_applications pa
       JOIN people p ON p.id = pa.person_id
       JOIN programs pr ON pr.id = pa.program_id
       WHERE LOWER(p.email) = LOWER($1)
       ORDER BY pa.created_at DESC`,
      [email]
    ),
    db.query<CohortRow>(
      `SELECT c.title AS cohort_title, c.start_date, c.end_date, pt.status AS participant_status, pt.id AS participant_id
       FROM participants pt
       JOIN cohorts c ON c.id = pt.cohort_id
       JOIN people p ON p.id = pt.person_id
       WHERE LOWER(p.email) = LOWER($1)
       ORDER BY c.start_date DESC`,
      [email]
    ),
    db.query<AttendanceRow>(
      `SELECT ar.session_date, ar.present
       FROM attendance_records ar
       JOIN participants pt ON pt.id = ar.participant_id
       JOIN people p ON p.id = pt.person_id
       WHERE LOWER(p.email) = LOWER($1)
       ORDER BY ar.session_date DESC`,
      [email]
    ),
  ]);

  const totalSessions = attendance.length;
  const sessionsAttended = attendance.filter((a) => a.present).length;
  const attendanceRate = totalSessions > 0
    ? Math.round((sessionsAttended / totalSessions) * 100)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary">My Programs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your applications, cohorts, and attendance.
        </p>
      </div>

      {/* Applications */}
      <section className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Applications ({applications.length})
          </h2>
          <Link href="/application-status" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Check status
          </Link>
        </div>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-secondary mt-2">No applications yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse our programs and apply to get started.</p>
            <Link href="/programs" className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline">
              View programs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 p-4 rounded-lg bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary truncate">{app.program_title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Applied {formatDate(app.created_at)}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cohorts */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          Cohort Enrollments ({cohorts.length})
        </h2>
        {cohorts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-secondary mt-2">No cohort enrollments</p>
            <p className="text-xs text-muted-foreground mt-1">Accepted applicants will see their cohort details here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cohorts.map((c, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-4 rounded-lg bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary">{c.cohort_title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(c.start_date)} — {formatDate(c.end_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(c.participant_status === "certificate_eligible" || c.participant_status === "completed") && (
                    <Link
                      href={`/certificate/${c.participant_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                    >
                      <Award className="h-3 w-3" /> Certificate
                    </Link>
                  )}
                  <StatusBadge status={c.participant_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Attendance */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
          <CalendarCheck className="h-4 w-4 text-primary" />
          Attendance
        </h2>
        {totalSessions === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-secondary mt-2">No attendance records</p>
            <p className="text-xs text-muted-foreground mt-1">Your session attendance will appear here once enrolled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-secondary">{totalSessions}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{sessionsAttended}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Attended</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Attendance Rate</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
