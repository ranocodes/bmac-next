import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicSession } from "@/lib/auth/public-auth";
import { db } from "@/lib/db";
import {
  FileText,
  Users,
  CalendarCheck,
  Shield,
  ArrowRight,
  Mail,
  LogOut,
  Award,
  Clock,
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import VolunteerHoursWidget from "./VolunteerHoursWidget";

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

interface RoleRow {
  kind: string;
  status: string;
  ref_title: string;
}

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  in_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  waitlisted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  withdrawn: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const ENROLLED_STYLE: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  dropped: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function statusBadge(status: string, map: Record<string, string> = STATUS_STYLE) {
  const cls =
    map[status] ??
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
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

function EmptyState({
  icon: Icon,
  title,
  description,
  link,
  linkLabel,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm font-semibold text-secondary">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {link && (
        <Link
          href={link}
          className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline"
        >
          {linkLabel ?? "Learn more"} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export default async function AccountPage() {
  const session = await getPublicSession();
  if (!session) redirect("/login");

  const rows = await db.query<{ email: string }>(
    `SELECT email FROM public.public_users WHERE id = $1 LIMIT 1`,
    [session.userId]
  );
  const email = rows[0]?.email || session.email;

  const personRows = await db.query<{ id: string }>(
    `SELECT id FROM public.people WHERE lower(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  const personId = personRows[0]?.id || "";

  const [applications, cohorts, attendance, roles] = await Promise.all([
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
    db.query<RoleRow>(
      `SELECT kind, status, ref_title
       FROM person_records pr
       JOIN people p ON p.id = pr.person_id
       WHERE LOWER(p.email) = LOWER($1) AND kind IN ('member', 'volunteer')
       ORDER BY pr.created_at DESC`,
      [email]
    ),
  ]);

  const totalSessions = attendance.length;
  const sessionsAttended = attendance.filter((a) => a.present).length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((sessionsAttended / totalSessions) * 100)
      : null;

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">
            My BMAC<span className="text-primary">.</span>
          </h1>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-2">
            <Mail className="h-3.5 w-3.5" />
            {email}
          </p>
        </div>

        <div className="space-y-8">
          {/* Program Applications */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Program Applications
              </h2>
              {applications.length > 0 && (
                <Link
                  href="/application-status"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Check status
                </Link>
              )}
            </div>
            {applications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No applications yet"
                description="Browse our programs and apply to get started."
                link="/programs"
                linkLabel="View programs"
              />
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-secondary truncate">
                          {app.program_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Applied {formatDate(app.created_at)}
                        </p>
                      </div>
                      {statusBadge(app.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Cohort Enrollment */}
          <section>
            <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              Cohort Enrollment
            </h2>
            {cohorts.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No cohort enrollments"
                description="Accepted applicants will see their cohort details here."
              />
            ) : (
              <div className="space-y-3">
                {cohorts.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-secondary truncate">
                          {c.cohort_title}
                        </p>
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
                        {statusBadge(c.participant_status, ENROLLED_STYLE)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Attendance */}
          <section>
            <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Attendance
            </h2>
            {totalSessions === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No attendance records"
                description="Your session attendance will appear here once enrolled."
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-display text-2xl font-bold text-secondary">
                      {totalSessions}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      Total Sessions
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-secondary">
                      {sessionsAttended}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      Attended
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-primary">
                      {attendanceRate}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      Attendance Rate
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Member / Volunteer Status */}
          <section>
            <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              Roles &amp; Status
            </h2>
            {roles.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No roles on record"
                description="Member and volunteer status will appear here."
              />
            ) : (
              <div className="space-y-3">
                {roles.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-secondary">
                          {r.ref_title || r.kind}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {r.kind}
                        </p>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Volunteer Hours */}
        <section className="mt-8">
          <h2 className="font-display text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            Volunteer Hours
          </h2>
          <VolunteerHoursWidget personId={personId} email={email} />
        </section>

        <div className="mt-10 flex flex-col items-center gap-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
