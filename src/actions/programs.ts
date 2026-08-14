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
import { sendWorkflowEmail } from "@/actions/emails";
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
    if (!program.applicationsOpen) {
      return { error: "Applications are not open for this program" };
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

    return { applicationId };
  } catch (err) {
    console.error("submitApplication error:", err);
    return { error: "Failed to submit application" };
  }
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
    if (!program.applicationsOpen) {
      return { error: "Applications are not open for this program" };
    }
    if (!program.isPaid) {
      return { error: "This program is free — use the apply form." };
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

    const person = await db.getById("people", app.person_id) as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    if (person) {
      await sendWorkflowEmail("application-status", person.email, `${person.first_name} ${person.last_name}`, {
        applicationId: input.applicationId,
        status: input.status,
        programTitle: app.program_id,
      });
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

    await db.create("participants", {
      id: genId("part"),
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
      await sendWorkflowEmail("program", person.email, `${person.first_name} ${person.last_name}`, {
        cohortTitle: cohortInfo.title,
        programTitle: cohortInfo.program_id,
        action: "accepted",
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