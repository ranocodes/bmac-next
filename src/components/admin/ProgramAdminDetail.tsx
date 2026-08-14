"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  ClipboardCheck,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import {
  getProgramDetail,
  updateApplicationStatus,
  createCohort,
  addParticipantToCohort,
  removeParticipantFromCohort,
  setParticipantOutcome,
  getCohortAttendanceSummary,
  recordAttendance,
} from "@/actions/programs";
import { useToast } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/auth/admin-context";

type Tab = "applications" | "cohorts" | "attendance";

const STATUS_OPTIONS = ["in_review", "accepted", "waitlisted", "rejected", "withdrawn"] as const;
const OUTCOME_OPTIONS = ["enrolled", "completed", "dropped", "certificate_eligible"] as const;

const statusColor: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-500",
  in_review: "bg-amber-500/10 text-amber-500",
  accepted: "bg-emerald-500/10 text-emerald-600",
  waitlisted: "bg-purple-500/10 text-purple-500",
  rejected: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

const outcomeColor: Record<string, string> = {
  enrolled: "bg-blue-500/10 text-blue-500",
  completed: "bg-emerald-500/10 text-emerald-600",
  dropped: "bg-destructive/10 text-destructive",
  certificate_eligible: "bg-amber-500/10 text-amber-500",
};

export default function ProgramAdminDetail({
  initialData,
  programId,
}: {
  initialData: any;
  programId: string;
}) {
  const [data, setData] = useState<any>(initialData);
  const [tab, setTab] = useState<Tab>("applications");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [busyId, setBusyId] = useState<string>("");
  const [newCohort, setNewCohort] = useState({ title: "", startDate: "", endDate: "", capacity: "" });
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<any[]>([]);
  const { toast, confirm } = useToast();
  const admin = useAdmin();
  const adminEmail = admin?.email || "";

  const program = data.program;
  const applications = useMemo(() => {
    let list = data.applications || [];
    if (statusFilter) list = list.filter((a: any) => a.status === statusFilter);
    return list;
  }, [data.applications, statusFilter]);

  const accepted = (data.applications || []).filter((a: any) => a.status === "accepted");
  const participantPersonIds = new Set((data.participants || []).map((p: any) => p.person_id));
  const assignable = accepted.filter((a: any) => !participantPersonIds.has(a.person_id));

  useEffect(() => {
    if (!selectedCohort) {
      setSummary([]);
      return;
    }
    getCohortAttendanceSummary(selectedCohort).then(setSummary);
  }, [selectedCohort]);

  async function refresh() {
    const next = await getProgramDetail(programId);
    if (next) setData(next);
  }

  async function setStatus(appId: string, status: (typeof STATUS_OPTIONS)[number]) {
    setBusyId(appId);
    const res = await updateApplicationStatus({ applicationId: appId, status, adminEmail });
    setBusyId("");
    toast(res.error || "Status updated", res.error ? "error" : undefined);
    await refresh();
  }

  async function addToCohort(application: any) {
    if (!selectedCohort) {
      toast("Select a cohort first", "error");
      return;
    }
    setBusyId(application.id);
    const res = await addParticipantToCohort({
      cohortId: selectedCohort,
      personId: application.person_id,
      applicationId: application.id,
    });
    setBusyId("");
    toast(res.error || "Added to cohort", res.error ? "error" : undefined);
    await refresh();
  }

  async function removeParticipant(participantId: string, name: string) {
    const ok = await confirm(`Remove ${name} from cohort?`);
    if (!ok) return;
    setBusyId(participantId);
    const res = await removeParticipantFromCohort({ participantId });
    setBusyId("");
    toast(res.error || "Removed", res.error ? "error" : undefined);
    await refresh();
  }

  async function setOutcome(participantId: string, outcome: (typeof OUTCOME_OPTIONS)[number]) {
    setBusyId(participantId);
    const res = await setParticipantOutcome({ participantId, outcome });
    setBusyId("");
    toast(res.error || "Outcome updated", res.error ? "error" : undefined);
    await refresh();
  }

  async function handleCreateCohort() {
    if (!newCohort.title.trim() || !newCohort.startDate || !newCohort.endDate) {
      toast("Title and dates are required", "error");
      return;
    }
    if (newCohort.endDate < newCohort.startDate) {
      toast("End date must be after start date", "error");
      return;
    }
    setBusyId("new-cohort");
    const res = await createCohort({
      programId,
      title: newCohort.title.trim(),
      startDate: newCohort.startDate,
      endDate: newCohort.endDate,
      capacity: Number(newCohort.capacity) || 0,
    });
    setBusyId("");
    if (res.error) {
      toast(res.error, "error");
    } else {
      toast("Cohort created");
      setNewCohort({ title: "", startDate: "", endDate: "", capacity: "" });
      await refresh();
    }
  }

  async function toggleAttendance(personId: string, present: boolean) {
    setBusyId(`${personId}-${attendanceDate}`);
    const res = await recordAttendance({
      cohortId: selectedCohort,
      personId,
      sessionDate: attendanceDate,
      present,
      markedBy: adminEmail,
    });
    setBusyId("");
    if (res.error) {
      toast(res.error, "error");
    } else {
      toast(present ? "Marked present" : "Marked absent");
      const next = await getCohortAttendanceSummary(selectedCohort);
      setSummary(next);
    }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "applications", label: "Applications", icon: ClipboardCheck },
    { key: "cohorts", label: "Cohorts & Participants", icon: Users },
    { key: "attendance", label: "Attendance", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/programs" className="p-2 rounded-xl border border-input bg-card hover:bg-muted/40 transition-colors">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Link>
          <div className="p-2.5 rounded-2xl bg-primary/10">
            <BookOpen size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">{program?.title || "Program"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {applications.length} applications · {(data.cohorts || []).length} cohorts · {(data.participants || []).length} participants
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-2xl p-1 max-w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? "bg-card text-secondary shadow-sm" : "text-muted-foreground hover:text-secondary"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-card text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <div className="relative max-w-md ml-auto">
              <select
                value={selectedCohort}
                onChange={e => setSelectedCohort(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Cohort to assign to…</option>
                {(data.cohorts || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title} ({c.participant_count}/{c.capacity || "∞"})</option>
                ))}
              </select>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
              <ClipboardCheck size={48} className="text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-secondary">
                {statusFilter ? "No applications with this status" : "No applications yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Applications appear here when someone applies on the public site
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-semibold text-secondary px-5 py-4">Applicant</th>
                      <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Email</th>
                      <th className="text-left font-semibold text-secondary px-5 py-4 hidden lg:table-cell">Motivation</th>
                      <th className="text-left font-semibold text-secondary px-5 py-4">Status</th>
                      <th className="text-right font-semibold text-secondary px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a: any) => (
                      <tr key={a.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {((a.first_name || "?")[0] + (a.last_name || "")[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-secondary">{a.first_name} {a.last_name}</p>
                              <p className="text-xs text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-xs text-muted-foreground">{a.email}</td>
                        <td className="px-5 py-4 hidden lg:table-cell text-xs text-muted-foreground max-w-[220px] truncate">{a.motivation || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor[a.status] || statusColor.submitted}`}>
                            {a.status?.replace(/_/g, " ") || "submitted"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {STATUS_OPTIONS.filter(s => s !== a.status).map(s => (
                              <button
                                key={s}
                                disabled={busyId === a.id}
                                onClick={() => setStatus(a.id, s)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-input bg-card text-secondary hover:bg-muted/40 disabled:opacity-50 transition-colors"
                              >
                                {s.replace(/_/g, " ")}
                              </button>
                            ))}
                            {a.status === "accepted" && !participantPersonIds.has(a.person_id) && (
                              <button
                                disabled={busyId === a.id || !selectedCohort}
                                onClick={() => addToCohort(a)}
                                title={!selectedCohort ? "Select a cohort first" : "Add to selected cohort"}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                <Plus size={13} /> Add to cohort
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "cohorts" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-3xl border border-border/50 p-6">
              <h2 className="font-display text-lg font-bold text-secondary mb-4">New cohort</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newCohort.title}
                  onChange={e => setNewCohort({ ...newCohort, title: e.target.value })}
                  placeholder="Cohort title"
                  className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newCohort.startDate}
                    onChange={e => setNewCohort({ ...newCohort, startDate: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-input bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <input
                    type="date"
                    value={newCohort.endDate}
                    onChange={e => setNewCohort({ ...newCohort, endDate: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-input bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <input
                  type="number"
                  value={newCohort.capacity}
                  onChange={e => setNewCohort({ ...newCohort, capacity: e.target.value })}
                  placeholder="Capacity (0 = unlimited)"
                  min={0}
                  className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  onClick={handleCreateCohort}
                  disabled={busyId === "new-cohort"}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Plus size={16} /> Create cohort
                </button>
              </div>
            </div>

            {assignable.length > 0 && (
              <div className="bg-card rounded-3xl border border-border/50 p-6">
                <h2 className="font-display text-lg font-bold text-secondary mb-3">Assign accepted applicants</h2>
                <p className="text-xs text-muted-foreground mb-4">Select a cohort above, then assign.</p>
                <div className="space-y-2">
                  {assignable.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/30 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-secondary truncate">{a.first_name} {a.last_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                      </div>
                      <button
                        onClick={() => addToCohort(a)}
                        disabled={busyId === a.id || !selectedCohort}
                        className="shrink-0 p-2 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-40 transition-colors"
                        title={!selectedCohort ? "Select a cohort first" : "Assign"}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {(data.cohorts || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
                <Users size={48} className="text-muted-foreground/20 mb-4" />
                <p className="text-sm font-medium text-secondary">No cohorts yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create a cohort to start assigning participants</p>
              </div>
            ) : (
              (data.cohorts || []).map((c: any) => {
                const members = (data.participants || []).filter((p: any) => p.cohort_id === c.id);
                return (
                  <div key={c.id} className="bg-card rounded-3xl border border-border/50 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/50">
                      <div>
                        <h3 className="font-display text-lg font-bold text-secondary">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(c.start_date).toLocaleDateString()} → {new Date(c.end_date).toLocaleDateString()}
                          {" · "}{c.participant_count}/{c.capacity || "∞"} filled
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500">
                        <Users size={13} /> {members.length} participants
                      </span>
                    </div>
                    {members.length === 0 ? (
                      <p className="px-6 py-8 text-sm text-muted-foreground text-center">No participants assigned yet</p>
                    ) : (
                      <div className="divide-y divide-border/20">
                        {members.map((p: any) => (
                          <div key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {((p.first_name || "?")[0] + (p.last_name || "")[0] || "?").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-secondary">{p.first_name} {p.last_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                            </div>
                            <select
                              value={p.status}
                              onChange={e => setOutcome(p.id, e.target.value as (typeof OUTCOME_OPTIONS)[number])}
                              disabled={busyId === p.id}
                              className="h-9 px-2.5 rounded-lg border border-input bg-card text-xs text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
                            >
                              {OUTCOME_OPTIONS.map(o => (
                                <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeParticipant(p.id, `${p.first_name} ${p.last_name}`)}
                              disabled={busyId === p.id}
                              className="p-2 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                              title="Remove from cohort"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-card rounded-3xl border border-border/50 p-4">
            <select
              value={selectedCohort}
              onChange={e => setSelectedCohort(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Select cohort…</option>
              {(data.cohorts || []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {!selectedCohort ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
              <Clock3 size={48} className="text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-secondary">Select a cohort to record attendance</p>
            </div>
          ) : summary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
              <CheckCircle2 size={48} className="text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-secondary">No attendance recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1">Mark participants present or absent for this session</p>
            </div>
          ) : (
            <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-semibold text-secondary px-5 py-4">Participant</th>
                      <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Attendance rate</th>
                      <th className="text-right font-semibold text-secondary px-5 py-4">This session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((row: any) => (
                      <tr key={row.personId} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {(row.name[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-secondary">{row.name}</p>
                              <p className="text-xs text-muted-foreground">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-3 max-w-[180px]">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${row.attendanceRate >= 75 ? "bg-emerald-500" : row.attendanceRate >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                                style={{ width: `${row.attendanceRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{row.attendanceRate}% ({row.present}/{row.total})</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleAttendance(row.personId, true)}
                              disabled={busyId === `${row.personId}-${attendanceDate}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle2 size={14} /> Present
                            </button>
                            <button
                              onClick={() => toggleAttendance(row.personId, false)}
                              disabled={busyId === `${row.personId}-${attendanceDate}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                            >
                              <XCircle size={14} /> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
