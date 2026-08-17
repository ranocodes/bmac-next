"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import {
  findOrCreatePerson,
  ensurePersonRoles,
  upsertPersonRecord,
} from "@/actions/people";
import { createWorkflowRecord } from "@/lib/workflows";
import { createAdminNotification } from "@/lib/notifications";
import { recordEvent } from "@/lib/analytics/record";
import { sendWorkflowEmail, sendPublicCredentialsEmail, sendApplicationStatusEmail } from "@/actions/emails";
import { logActivity } from "@/actions/activity-logs";
import { scheduleWelcomeSequence } from "@/actions/email-sequences";
import { verifyPaystackTransaction } from "@/lib/paystack-confirm";
import { assertSafe, getClientIp, recordSubmission } from "@/lib/spam-guard";
import type {
  Program,
  ProgramApplication,
  Cohort,
  Participant,
  AttendanceRecord,
} from "@/types/cms";

function genId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function submitApplication(input: {
  programId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  motivation: string;
  consent: boolean;
}): Promise<{ applicationId?: string; error?: string }> {
  if (!input.consent) {
    return { error: "Consent is required" };
  }
  if (!input.motivation.trim()) {
    return { error: "Motivation is required" };
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { error: "Valid email is required" };
  }

  try {
    const program = await db.getById<Program>("programs", input.programId);
    if (!program || program.status !== "published") {
      return { error: "Program not available for applications" };
    }
    if (!(program as any).applications_open && !program.applicationsOpen) {
      return { error: "Applications are not open for this program" };
    }
    if (input.dateOfBirth) {
      const age = ageFromDate(input.dateOfBirth);
      if (age !== null && age < 16) {
        return { error: "This program is open to ages 16 and above." };
      }
    }

    const dup = await db.query<{ id: string }>(
      `SELECT a.id FROM public.program_applications a
       JOIN public.people p ON p.id = a.person_id
       WHERE a.program_id = $1 AND LOWER(p.email) = LOWER($2) AND a.status != 'withdrawn'
       LIMIT 1`,
      [input.programId, input.email]
    );
    if (dup.length) {
      return { error: "You've already applied to this program." };
    }

    const person = await findOrCreatePerson({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    });

    if (!person) {
      return { error: "Failed to create person record" };
    }

    await ensurePersonRoles(person.id, ["applicant"]);

    const applicationId = genId("app");
    await db.create("program_applications", {
      id: applicationId,
      program_id: input.programId,
      person_id: person.id,
      status: "submitted",
      motivation: input.motivation,
      date_of_birth: input.dateOfBirth || null,
      consent: input.consent,
    });

    await upsertPersonRecord(person.id, "program", {
      refId: input.programId,
      refTitle: program.title,
      status: "pending",
      meta: { applicationId },
    });

    await createWorkflowRecord({
      kind: "program",
      refId: applicationId,
      title: `Application for ${program.title}`,
      summary: `${input.firstName} ${input.lastName} applied to ${program.title}`,
      status: "open",
      priority: "normal",
      assigneeEmail: "",
      submitterName: `${input.firstName} ${input.lastName}`,
      submitterEmail: input.email,
      source: "program_application",
      details: { programId: input.programId, motivation: input.motivation },
    });

    await sendWorkflowEmail("program", input.email, `${input.firstName} ${input.lastName}`, {
      programTitle: program.title,
      applicationId,
    });

    await createAdminNotification({
      title: "New program application",
      message: `${input.firstName} ${input.lastName} applied to ${program.title}`,
      type: "program",
      link: `/admin/programs/${input.programId}`,
    });

    await recordEvent({
      name: "program_applied",
      path: "/",
      properties: { programId: input.programId, applicationId, paid: false },
    });

    return { applicationId };
  } catch (err) {
    console.error("submitApplication error:", err);
    return { error: "Failed to submit application" };
  }
}

function ageFromDate(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function genProgramReference(): string {
  return `BMAC-PRG-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createProgramOrder(input: {
  programId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  motivation: string;
  consent: boolean;
}): Promise<{ error?: string; reference?: string; amountKobo?: number; applicationId?: string }> {
  if (!input.consent) {
    return { error: "Consent is required" };
  }
  if (!input.motivation.trim()) {
    return { error: "Motivation is required" };
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { error: "Valid email is required" };
  }

  try {
    const program = await db.getById<Program>("programs", input.programId);
    if (!program || program.status !== "published") {
      return { error: "Program not available for applications" };
    }
    if (!(program as any).applications_open && !program.applicationsOpen) {
      return { error: "Applications are not open for this program" };
    }
    if (!program.isPaid) {
      return { error: "This program is free — use the apply form." };
    }
    if (input.dateOfBirth) {
      const age = ageFromDate(input.dateOfBirth);
      if (age !== null && age < 16) {
        return { error: "This program is open to ages 16 and above." };
      }
    }

    const dup = await db.query<{ id: string }>(
      `SELECT a.id FROM public.program_applications a
       JOIN public.people p ON p.id = a.person_id
       WHERE a.program_id = $1 AND LOWER(p.email) = LOWER($2) AND a.status != 'withdrawn'
       LIMIT 1`,
      [input.programId, input.email]
    );
    if (dup.length) {
      return { error: "You've already applied to this program." };
    }

    const person = await findOrCreatePerson({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    });

    if (!person) {
      return { error: "Failed to create person record" };
    }

    await ensurePersonRoles(person.id, ["applicant"]);

    const reference = genProgramReference();
    const applicationId = genId("app");
    await db.create("program_applications", {
      id: applicationId,
      program_id: input.programId,
      person_id: person.id,
      status: "submitted",
      motivation: input.motivation,
      date_of_birth: input.dateOfBirth || null,
      consent: input.consent,
      payment_reference: reference,
    });

    await upsertPersonRecord(person.id, "program", {
      refId: input.programId,
      refTitle: program.title,
      status: "pending",
      meta: { applicationId, reference },
    });

    await createWorkflowRecord({
      kind: "program",
      refId: applicationId,
      title: `Paid application for ${program.title}`,
      summary: `${input.firstName} ${input.lastName} applied to ${program.title}`,
      status: "open",
      priority: "normal",
      assigneeEmail: "",
      submitterName: `${input.firstName} ${input.lastName}`,
      submitterEmail: input.email,
      source: "program_application",
      details: { programId: input.programId, motivation: input.motivation, reference },
      outcome: "Awaiting payment verification",
    });

    return {
      reference,
      amountKobo: Number(program.price || 0) * 100,
      applicationId,
    };
  } catch (err) {
    console.error("createProgramOrder error:", err);
    return { error: "Failed to start application payment" };
  }
}

export interface ApplicationLookupResult {
  applicationId: string;
  status: string;
  programId: string;
  programTitle: string;
  cohortTitle?: string;
  appliedAt: string;
}

export async function lookupApplicationStatus(input: {
  email: string;
  applicationId: string;
}): Promise<{ error?: string; result?: ApplicationLookupResult }> {
  const cleanEmail = (input.email || "").trim().toLowerCase();
  const cleanRef = (input.applicationId || "").trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: "Please enter a valid email address." };
  }
  if (cleanRef.length > 80) {
    return { error: "Application reference looks invalid." };
  }
  if (!/^app-/i.test(cleanRef)) {
    return { error: "Application references start with “app-” (e.g. app-abc123)." };
  }

  const guard = await assertSafe("application-status", cleanEmail, await getClientIp());
  if (guard.error) return { error: guard.error };

  try {
    await recordSubmission("application-status", cleanEmail, await getClientIp());
    const rows = await db.query<any>(
      `SELECT pa.id, pa.status, pa.program_id, pa.created_at,
              LOWER(COALESCE(p.email, '')) AS email,
              pr.title AS program_title,
              c.title AS cohort_title
       FROM public.program_applications pa
       JOIN public.people p ON p.id = pa.person_id
       JOIN public.programs pr ON pr.id = pa.program_id
       LEFT JOIN public.participants pt ON pt.person_id = p.id AND pt.status != 'dropped'
       LEFT JOIN public.cohorts c ON c.id = pt.cohort_id AND c.program_id = pa.program_id
       WHERE pa.id = $1 AND LOWER(COALESCE(p.email, '')) = LOWER($2)
       LIMIT 1`,
      [cleanRef, cleanEmail]
    );
    const row = rows[0];
    if (!row) {
      return { error: "No application matches that reference and email. Double-check both and try again." };
    }
    return {
      result: {
        applicationId: row.id,
        status: row.status,
        programId: row.program_id,
        programTitle: row.program_title || "",
        cohortTitle: row.cohort_title || undefined,
        appliedAt: row.created_at,
      },
    };
  } catch (err) {
    console.error("lookupApplicationStatus error:", err);
    return { error: "Something went wrong. Try again." };
  }
}

export async function getProgramPaymentStatus(reference: string): Promise<{
  status: string;
  applicationId?: string;
}> {
  const rows = await db.query<{ id: string; status: string }>(
    "SELECT id, status FROM public.paystack_payments WHERE reference = $1",
    [reference]
  );
  if (rows.length && rows[0].status === "completed") {
    const app = await db.query<{ id: string }>(
      "SELECT id FROM public.program_applications WHERE payment_reference = $1",
      [reference]
    );
    return { status: "completed", applicationId: app[0]?.id };
  }
  return { status: "pending" };
}

export async function verifyProgramPayment(reference: string): Promise<{
  status: string;
  applicationId?: string;
  error?: string;
}> {
  if (!reference) return { status: "not_found" };
  const result = await verifyPaystackTransaction(reference);
  if (result.status !== "completed") return { status: result.status, error: result.error };
  return getProgramPaymentStatus(reference);
}

export async function updateApplicationStatus(input: {
  applicationId: string;
  status: "submitted" | "in_review" | "accepted" | "waitlisted" | "rejected" | "withdrawn";
  adminEmail: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const app = await db.getById("program_applications", input.applicationId) as {
      id: string;
      program_id: string;
      person_id: string;
    };
    if (!app) {
      return { success: false, error: "Application not found" };
    }

    await db.update("program_applications", input.applicationId, {
      status: input.status,
      updated_at: new Date().toISOString(),
    });

    await logActivity(input.adminEmail, "program_application_status", "program_applications", {
      resourceId: input.applicationId,
      details: `Program application ${input.applicationId} status → ${input.status}`,
    });

    const person = await db.getById("people", app.person_id) as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    if (person) {
      const program = await db.getById("programs", app.program_id) as { title?: string } | null;
      const programTitle = program?.title || app.program_id;

      if (input.status === "rejected") {
        await sendApplicationStatusEmail({
          email: person.email,
          firstName: person.first_name,
          programTitle,
          status: "rejected",
          note: " Not selected this time — try next cohort.",
        });
      } else if (input.status === "accepted") {
        await sendWorkflowEmail("program", person.email, `${person.first_name} ${person.last_name}`, {
          applicationId: input.applicationId,
          status: input.status,
          programTitle,
          action: "accepted",
        });
        await scheduleWelcomeSequence(person.id, person.email, person.first_name).catch((err) => {
          console.error("Welcome sequence scheduling failed:", err);
        });
      } else {
        await sendWorkflowEmail("application-status", person.email, `${person.first_name} ${person.last_name}`, {
          applicationId: input.applicationId,
          status: input.status,
          programTitle,
        });
      }
    }

    await createAdminNotification({
      title: `Application ${input.status}`,
      message: `Application ${input.applicationId} marked as ${input.status}`,
      type: "program",
      link: `/admin/programs/${app.program_id}`,
    });

    return { success: true };
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return { success: false, error: "Failed to update status" };
  }
}

export async function createCohort(input: {
  programId: string;
  title: string;
  startDate: string;
  endDate: string;
  capacity: number;
}): Promise<{ cohortId?: string; error?: string }> {
  try {
    await requireAdmin();

    const program = await db.getById("programs", input.programId);
    if (!program) {
      return { error: "Program not found" };
    }

    const cohortId = genId("cohort");
    await db.create("cohorts", {
      id: cohortId,
      program_id: input.programId,
      title: input.title,
      start_date: input.startDate,
      end_date: input.endDate,
      capacity: input.capacity,
    });

    return { cohortId };
  } catch (err) {
    console.error("createCohort error:", err);
    return { error: "Failed to create cohort" };
  }
}

export async function addParticipantToCohort(input: {
  cohortId: string;
  personId: string;
  applicationId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const cohortData = await db.getById("cohorts", input.cohortId) as {
      id: string;
      title: string;
      capacity: number;
    };
    if (!cohortData) {
      return { success: false, error: "Cohort not found" };
    }

    const existing = await db.query<{ id: string }>(
      "SELECT id FROM public.participants WHERE cohort_id = $1 AND person_id = $2",
      [input.cohortId, input.personId]
    );
    if (existing.length > 0) {
      return { success: false, error: "Person already in cohort" };
    }

    const participantCount = await db.query<{ count: string }>(
      "SELECT COUNT(*)::int AS count FROM public.participants WHERE cohort_id = $1",
      [input.cohortId]
    );
    if (Number(participantCount[0]?.count ?? 0) >= cohortData.capacity && cohortData.capacity > 0) {
      return { success: false, error: "Cohort is full" };
    }

    const participantId = genId("part");
    await db.create("participants", {
      id: participantId,
      cohort_id: input.cohortId,
      person_id: input.personId,
      status: "enrolled",
    });

    if (input.applicationId) {
      await db.update("program_applications", input.applicationId, {
        status: "accepted",
        updated_at: new Date().toISOString(),
      });
    }

    const person = await db.getById("people", input.personId) as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    const cohortInfo = await db.getById("cohorts", input.cohortId) as {
      id: string;
      title: string;
      capacity: number;
      program_id: string;
    };
    if (person && cohortInfo) {
      const program = await db.getById("programs", cohortInfo.program_id) as { title?: string } | null;
      const programTitle = program?.title || cohortInfo.program_id;

      await sendWorkflowEmail("program", person.email, `${person.first_name} ${person.last_name}`, {
        cohortTitle: cohortInfo.title,
        programTitle,
        action: "accepted",
      });

      await createWorkflowRecord({
        kind: "program",
        refId: input.applicationId ?? "",
        title: `Accepted to ${cohortInfo.title}`,
        summary: `${person.first_name} ${person.last_name} enrolled in ${cohortInfo.title}`,
        status: "closed",
        priority: "normal",
        assigneeEmail: "",
        submitterName: `${person.first_name} ${person.last_name}`,
        submitterEmail: person.email,
        source: "cohort_enrollment",
        details: { cohortId: input.cohortId, personId: input.personId },
      });

      await upsertPersonRecord(person.id, "program", {
        refId: cohortInfo.program_id,
        refTitle: cohortInfo.title,
        status: "active",
        meta: { cohortId: input.cohortId, applicationId: input.applicationId },
      });

      await logActivity("system", "cohort_enrollment", "participants", {
        resourceId: participantId,
        details: `Enrolled in cohort ${cohortInfo.title}`,
      });

      await createAdminNotification({
        title: "New cohort enrollment",
        message: `${person.first_name} ${person.last_name} enrolled in ${cohortInfo.title}`,
        type: "program",
        link: `/admin/programs/${cohortInfo.program_id}`,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("addParticipantToCohort error:", err);
    return { success: false, error: "Failed to add participant" };
  }
}

export async function recordAttendance(input: {
  cohortId: string;
  personId: string;
  sessionDate: string;
  present: boolean;
  markedBy: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const cohortData = await db.getById("cohorts", input.cohortId);
    if (!cohortData) {
      return { success: false, error: "Cohort not found" };
    }

    const existing = await db.query<{ id: string }>(
      "SELECT id FROM public.attendance_records WHERE cohort_id = $1 AND person_id = $2 AND session_date = $3",
      [input.cohortId, input.personId, input.sessionDate]
    );

    if (existing.length > 0) {
      await db.update("attendance_records", existing[0].id, {
        present: input.present,
        marked_by: input.markedBy,
        marked_at: new Date().toISOString(),
      });
    } else {
      await db.create("attendance_records", {
        id: genId("att"),
        cohort_id: input.cohortId,
        person_id: input.personId,
        session_date: input.sessionDate,
        present: input.present,
        marked_by: input.markedBy,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("recordAttendance error:", err);
    return { success: false, error: "Failed to record attendance" };
  }
}

export async function getProgramDetail(programId: string): Promise<{
  program: any;
  applications: any[];
  cohorts: any[];
  participants: any[];
} | null> {
  try {
    const program = await db.getById("programs", programId);
    if (!program) return null;

    const applications = await db.query<any>(
      `SELECT pa.*, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth
       FROM public.program_applications pa
       JOIN public.people p ON p.id = pa.person_id
       WHERE pa.program_id = $1
       ORDER BY pa.created_at DESC`,
      [programId]
    );

    const cohorts = await db.query<any>(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM public.participants WHERE cohort_id = c.id) as participant_count
       FROM public.cohorts c
       WHERE c.program_id = $1
       ORDER BY c.start_date DESC`,
      [programId]
    );

    const participants = await db.query<any>(
      `SELECT pt.*, p.first_name, p.last_name, p.email, c.title as cohort_title
       FROM public.participants pt
       JOIN public.people p ON p.id = pt.person_id
       JOIN public.cohorts c ON c.id = pt.cohort_id
       WHERE c.program_id = $1
       ORDER BY pt.joined_at DESC`,
      [programId]
    );

    return { program, applications, cohorts, participants };
  } catch (err) {
    console.error("getProgramDetail error:", err);
    return null;
  }
}

export async function listApplications(programId: string, status?: string): Promise<any[]> {
  try {
    let sql = `SELECT pa.*, p.first_name, p.last_name, p.email, p.phone
               FROM public.program_applications pa
               JOIN public.people p ON p.id = pa.person_id
               WHERE pa.program_id = $1`;
    const params: any[] = [programId];
    if (status) {
      sql += " AND pa.status = $2";
      params.push(status);
    }
    sql += " ORDER BY pa.created_at DESC";
    return await db.query<any>(sql, params);
  } catch (err) {
    console.error("listApplications error:", err);
    return [];
  }
}

export async function removeParticipantFromCohort(input: {
  participantId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const rows = await db.query<{ id: string }>(
      "DELETE FROM public.participants WHERE id = $1 RETURNING id",
      [input.participantId]
    );
    if (!rows.length) return { success: false, error: "Participant not found" };
    return { success: true };
  } catch (err) {
    console.error("removeParticipantFromCohort error:", err);
    return { success: false, error: "Failed to remove participant" };
  }
}

export async function setParticipantOutcome(input: {
  participantId: string;
  outcome: "enrolled" | "completed" | "dropped" | "certificate_eligible";
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const rows = await db.query<{ id: string }>(
      `UPDATE public.participants
          SET status = $2, updated_at = now()
        WHERE id = $1
        RETURNING id`,
      [input.participantId, input.outcome]
    );
    if (!rows.length) return { success: false, error: "Participant not found" };

    const participant = await db.getById("participants", input.participantId) as {
      person_id: string;
      cohort_id: string;
    } | null;
    if (participant) {
      const person = await db.getById("people", participant.person_id) as {
        email: string;
        first_name: string;
        last_name: string;
      } | null;
      const cohort = await db.getById("cohorts", participant.cohort_id) as {
        title: string;
      } | null;
      if (person?.email) {
        await sendWorkflowEmail("program", person.email, `${person.first_name} ${person.last_name}`, {
          cohortTitle: cohort?.title || "",
          action: input.outcome,
        }).catch(err => console.error("participant-outcome email error:", err));
      }
    }

    return { success: true };
  } catch (err) {
    console.error("setParticipantOutcome error:", err);
    return { success: false, error: "Failed to update participant outcome" };
  }
}

export async function getParticipantAttendance(input: {
  cohortId: string;
  personId?: string;
}): Promise<any[]> {
  try {
    await requireAdmin();
    let sql = `SELECT ar.*, p.first_name, p.last_name, p.email
               FROM public.attendance_records ar
               JOIN public.people p ON p.id = ar.person_id
               WHERE ar.cohort_id = $1`;
    const params: any[] = [input.cohortId];
    if (input.personId) {
      sql += " AND ar.person_id = $2";
      params.push(input.personId);
    }
    sql += " ORDER BY ar.session_date DESC";
    return await db.query<any>(sql, params);
  } catch (err) {
    console.error("getParticipantAttendance error:", err);
    return [];
  }
}

export async function getCohortAttendanceSummary(cohortId: string): Promise<
  { personId: string; name: string; email: string; present: number; total: number; attendanceRate: number }[]
> {
  try {
    await requireAdmin();
    const rows = await db.query<any>(
      `SELECT ar.person_id, p.first_name, p.last_name, p.email,
              COUNT(*) FILTER (WHERE ar.present)::int AS present,
              COUNT(*)::int AS total
       FROM public.attendance_records ar
       JOIN public.people p ON p.id = ar.person_id
       WHERE ar.cohort_id = $1
       GROUP BY ar.person_id, p.first_name, p.last_name, p.email
       ORDER BY p.first_name`,
      [cohortId]
    );
    return rows.map(r => ({
      personId: r.person_id,
      name: `${r.first_name} ${r.last_name}`.trim(),
      email: r.email || "",
      present: Number(r.present ?? 0),
      total: Number(r.total ?? 0),
      attendanceRate: Number(r.total) ? Math.round((Number(r.present) / Number(r.total)) * 100) : 0,
    }));
  } catch (err) {
    console.error("getCohortAttendanceSummary error:", err);
    return [];
  }
}

export async function sendPublicCredentials(input: {
  personId: string;
  programId?: string;
}): Promise<{ success: boolean; error?: string; password?: string }> {
  try {
    await requireAdmin();

    const person = await db.getById("people", input.personId) as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    } | null;
    if (!person) return { success: false, error: "Person not found" };

    let driveLink: string | undefined;
    let contextLabel = "BMAC";

    if (input.programId) {
      const program = await db.getById("programs", input.programId) as {
        id: string;
        title: string;
        settings?: { googleDriveLink?: string };
      } | null;
      driveLink = program?.settings?.googleDriveLink || undefined;
      contextLabel = program?.title || input.programId;
    } else {
      const record = await db.query<{ ref_title: string }>(
        `SELECT ref_title FROM public.person_records WHERE person_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
        [input.personId]
      );
      if (record.length) contextLabel = record[0].ref_title;
    }

    const { hashPassword, generateRandomPassword } = await import("@/lib/auth/public-auth");
    const rawPassword = generateRandomPassword();
    const passwordHash = await hashPassword(rawPassword);

    const existing = await db.query<{ id: string }>(
      `SELECT id FROM public.public_users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [person.email]
    );

    if (existing.length > 0) {
      await db.update("public_users", existing[0].id, {
        password_hash: passwordHash,
        must_change_password: true,
        auth_status: "active",
      });
    } else {
      await db.create("public_users", {
        id: `pu-${crypto.randomUUID()}`,
        email: person.email,
        password_hash: passwordHash,
        must_change_password: true,
        auth_status: "active",
      });
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

    await sendPublicCredentialsEmail({
      email: person.email,
      firstName: person.first_name,
      password: rawPassword,
      loginUrl,
      driveLink,
    });

    await logActivity("system", "credentials_sent", "public_users", {
      resourceId: person.id,
      details: `Credentials sent to ${person.email} for ${contextLabel}`,
    });

    return { success: true, password: rawPassword };
  } catch (err) {
    console.error("sendPublicCredentials error:", err);
    return { success: false, error: "Failed to send credentials" };
  }
}