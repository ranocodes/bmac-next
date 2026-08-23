"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/server";
import {
  upsertPersonRecord,
} from "@/lib/people";
import { createAdminNotification } from "@/lib/notifications";
import { sendWorkflowEmail, sendPublicCredentialsEmail, sendApplicationStatusEmail, sendPaymentRequiredEmail } from "@/actions/emails";
import { logActivity } from "@/lib/activity-log";
import { verifyPaystackTransaction } from "@/lib/paystack-confirm";
import { assertSafe, getClientIp, recordSubmission } from "@/lib/spam-guard";
import type {
  ProgramApplication,
  Cohort,
  Participant,
  AttendanceRecord,
} from "@/types/cms";
import { SITE_URL } from "@/lib/site";

function genId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export interface ApplicationLookupResult {
  applicationId: string;
  status: string;
  programId: string;
  programTitle: string;
  cohortTitle?: string;
  appliedAt: string;
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
      const program = await db.getById("programs", app.program_id) as { title?: string; price?: number; slug?: string; is_paid?: boolean; isPaid?: boolean; payment_timing?: string; paymentTiming?: string } | null;
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
        const isPaid = (program as any)?.is_paid || program?.isPaid;
        const payTiming = (program as any)?.payment_timing || program?.paymentTiming || "immediate";

        if (isPaid && payTiming === "after_acceptance") {
          const price = Number(program?.price || 0);
          const appRef = (app as any).payment_reference || input.applicationId;
          const paymentUrl = `${SITE_URL}/apply/${app.program_id}/pay?ref=${appRef}`;
          await sendPaymentRequiredEmail({
            email: person.email,
            firstName: person.first_name,
            programTitle,
            amountLabel: `₦${price.toLocaleString()}`,
            reference: appRef,
            paymentUrl,
          });
        } else {
          await sendWorkflowEmail("program", person.email, `${person.first_name} ${person.last_name}`, {
            applicationId: input.applicationId,
            status: input.status,
            programTitle,
            action: "accepted",
          });
        }
      } else {
        await sendWorkflowEmail("application-status", person.email, `${person.first_name} ${person.last_name}`, {
          applicationId: input.applicationId,
          status: input.status,
          programTitle,
        });
      }
    }

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
    let program = await db.getById("programs", programId);
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

    const loginUrl = `${SITE_URL}/login`;

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