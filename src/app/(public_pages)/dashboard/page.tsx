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
  Heart,
  CheckCircle,
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

interface VolunteerRow {
  kind: string;
  status: string;
  ref_title: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-amber-100 text-amber-700",
  withdrawn: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
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

export default async function DashboardPage() {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const emailRows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = emailRows[0]?.email || session.email;

  const userRole = await getUserRole(email);
  if (!userRole || userRole.primaryRole === "none") {
    redirect("/account");
  }

  const [applications, cohorts, attendance, volunteerRecords] = await Promise.all([
    userRole.isMember ? db.query<ApplicationRow>(
      `SELECT pa.id, pa.status, pa.created_at, pr.title AS program_title
       FROM program_applications pa
       JOIN people p ON p.id = pa.person_id
       JOIN programs pr ON pr.id = pa.program_id
       WHERE LOWER(p.email) = LOWER($1)
       ORDER BY pa.created_at DESC`,
      [email]
    ) : Promise.resolve([]),
    userRole.isMember ? db.query<CohortRow>(
      `SELECT c.title AS cohort_title, c.start_date, c.end_date, pt.status AS participant_status, pt.id AS participant_id
       FROM participants pt
       JOIN cohorts c ON c.id = pt.cohort_id
       JOIN people p ON p.id = pt.person_id
       WHERE LOWER(p.email) = LOWER($1)
       ORDER BY c.start_date DESC`,
      [email]
    ) : Promise.resolve([]),
    userRole.isMember ? db.query<AttendanceRow>(
      `SELECT ar.session_date, ar.present
       FROM attendance_records ar
       JOIN participants pt ON pt.id = ar.participant_id
       JOIN people p ON p.id = pt.person_id
       WHERE LOWER(p.email) = LOWER($1)
       ORDER BY ar.session_date DESC`,
      [email]
    ) : Promise.resolve([]),
    userRole.isVolunteer ? db.query<VolunteerRow>(
      `SELECT kind, status, ref_title, created_at
       FROM person_records pr
       JOIN people p ON p.id = pr.person_id
       WHERE LOWER(p.email) = LOWER($1) AND kind = 'volunteer'
       ORDER BY pr.created_at DESC`,
      [email]
    ) : Promise.resolve([]),
  ]);

  const totalSessions = attendance.length;
  const sessionsAttended = attendance.filter((a) => a.present).length;
  const attendanceRate = totalSessions > 0
    ? Math.round((sessionsAttended / totalSessions) * 100)
    : null;

  const activeEnrollment = cohorts.find(c => c.participant_status === "enrolled" || c.participant_status === "certificate_eligible");
  const volunteerStatus = volunteerRecords[0]?.status || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary">
          Welcome back, {userRole.firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userRole.primaryRole === "combined"
            ? "You have both member and volunteer access."
            : userRole.primaryRole === "member"
            ? "View your programs, cohorts, and attendance."
            : "View your volunteer status and activities."}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {userRole.isMember && (
          <>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-bold text-secondary">{applications.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Applications</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-bold text-secondary">{cohorts.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Cohorts</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-bold text-primary">{attendanceRate !== null ? `${attendanceRate}%` : "—"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Attendance</p>
            </div>
          </>
        )}
        {userRole.isVolunteer && (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-emerald-600">{volunteerStatus || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Volunteer Status</p>
          </div>
        )}
      </div>

      {/* Member Section */}
      {userRole.isMember && (
        <div className="space-y-6">
          {/* Active Enrollment */}
          {activeEnrollment && (
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Active Enrollment
              </h2>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-secondary">{activeEnrollment.cohort_title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(activeEnrollment.start_date)} — {formatDate(activeEnrollment.end_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(activeEnrollment.participant_status === "certificate_eligible" || activeEnrollment.participant_status === "completed") && (
                    <Link
                      href={`/certificate/${activeEnrollment.participant_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Award className="h-3.5 w-3.5" /> Certificate
                    </Link>
                  )}
                  <StatusBadge status={activeEnrollment.participant_status} />
                </div>
              </div>
            </section>
          )}

          {/* Recent Applications */}
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Recent Applications
              </h2>
              {applications.length > 0 && (
                <Link href="/application-status" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View all
                </Link>
              )}
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-secondary mt-2">No applications yet</p>
                <p className="text-xs text-muted-foreground mt-1">Browse programs and apply to get started.</p>
                <Link href="/programs" className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline">
                  View programs <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-secondary truncate">{app.program_title}</p>
                      <p className="text-xs text-muted-foreground">Applied {formatDate(app.created_at)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Attendance Summary */}
          {totalSessions > 0 && (
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Attendance Summary
              </h2>
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
            </section>
          )}
        </div>
      )}

      {/* Volunteer Section */}
      {userRole.isVolunteer && (
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
            <Heart className="h-4 w-4 text-emerald-600" />
            Volunteer Status
          </h2>
          {volunteerRecords.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-secondary mt-2">No volunteer records</p>
              <p className="text-xs text-muted-foreground mt-1">Apply as a volunteer to get started.</p>
              <Link href="/get-involved" className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline">
                Apply now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {volunteerRecords.map((v, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-secondary">{v.ref_title || "Volunteer"}</p>
                    <p className="text-xs text-muted-foreground">Since {formatDate(v.created_at)}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
