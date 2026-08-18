"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
import { sendApplicationReceivedEmail } from "@/lib/email";
import { createAdminNotification } from "@/lib/notifications";
import { createWorkflowRecord } from "@/lib/workflows";
import { recordConsent } from "@/lib/consent";
import { assertSafe, getClientIp, recordSubmission, HONEYPOT_FIELD } from "@/lib/spam-guard";
import { submitForm } from "@/actions/forms";
import type { Person, PersonRecord, PersonRecordKind, PersonRole, PersonRow, WorkflowKind } from "@/types/cms";

interface PersonDbRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: string[] | string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface PersonRecordDbRow {
  id: string;
  person_id: string;
  kind: string;
  ref_id: string;
  ref_title: string;
  status: string;
  meta: Record<string, unknown> | string;
  created_at: string;
}

function parseRoles(roles: string[] | string): PersonRole[] {
  if (Array.isArray(roles)) return roles as PersonRole[];
  try {
    return (JSON.parse(roles || "[]") as string[]) as PersonRole[];
  } catch {
    return [];
  }
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function rowToPerson(row: PersonDbRow): Person {
  return {
    id: row.id,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    roles: parseRoles(row.roles),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToRecord(row: PersonRecordDbRow): PersonRecord {
  let meta: Record<string, unknown> = {};
  try {
    meta = typeof row.meta === "string" ? JSON.parse(row.meta || "{}") : (row.meta ?? {});
  } catch {
    meta = {};
  }
  return {
    id: row.id,
    personId: row.person_id,
    kind: row.kind as PersonRecordKind,
    refId: row.ref_id ?? "",
    refTitle: row.ref_title ?? "",
    status: row.status ?? "",
    meta,
    createdAt: row.created_at,
  };
}

export async function findOrCreatePerson(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}): Promise<Person | null> {
  const firstName = (input.firstName || "").trim();
  const lastName = (input.lastName || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phone = (input.phone || "").trim();

  try {
    let person: Person | null = null;

    if (email) {
      const byEmail = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE lower(email) = $1", [email]);
      if (byEmail.length) person = rowToPerson(byEmail[0]);
    }

    if (!person && phone) {
      const byPhone = await db.query<PersonDbRow>(
        "SELECT * FROM public.people WHERE phone = $1 AND phone <> ''",
        [phone]
      );
      if (byPhone.length) person = rowToPerson(byPhone[0]);
    }

    if (!person && (firstName || lastName)) {
      const byName = await db.query<PersonDbRow>(
        "SELECT * FROM public.people WHERE lower(first_name) = $1 AND lower(last_name) = $2",
        [firstName.toLowerCase(), lastName.toLowerCase()]
      );
      if (byName.length) person = rowToPerson(byName[0]);
    }

    if (!person) {
      const id = `person-${crypto.randomUUID()}`;
      const reselect = email
        ? { q: "SELECT * FROM public.people WHERE lower(email) = $1", p: [email] }
        : phone
          ? { q: "SELECT * FROM public.people WHERE phone = $1 AND phone <> ''", p: [phone] }
          : { q: "SELECT * FROM public.people WHERE id = $1", p: [id] };
      try {
        await db.query(
          `INSERT INTO public.people (id, first_name, last_name, email, phone, roles)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
          [id, firstName, lastName, email, phone, JSON.stringify([])]
        );
      } catch (insertErr) {
        console.warn("findOrCreatePerson insert conflict:", errMessage(insertErr));
      }
      let inserted: PersonDbRow[] = [];
      try {
        inserted = await db.query<PersonDbRow>(reselect.q, reselect.p);
      } catch (reselectErr) {
        console.error("findOrCreatePerson reselect error:", errMessage(reselectErr));
      }
      person = inserted.length ? rowToPerson(inserted[0]) : null;
      if (person) {
        logActivity("system", "person_create", "people", {
          resourceId: person.id,
          details: `Created person: ${email || phone || firstName || person.id}`,
        });
      }
    } else {
      const updates: string[] = [];
      const params: unknown[] = [];
      let idx = 1;
      if (firstName && !person.firstName) {
        updates.push(`first_name = $${idx++}`);
        params.push(firstName);
      }
      if (lastName && !person.lastName) {
        updates.push(`last_name = $${idx++}`);
        params.push(lastName);
      }
      if (phone && !person.phone) {
        updates.push(`phone = $${idx++}`);
        params.push(phone);
      }
      if (updates.length) {
        await db.query(
          `UPDATE public.people SET ${updates.join(", ")}, updated_at = now() WHERE id = $${idx}`,
          [...params, person.id]
        );
        const refreshed = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [person.id]);
        if (refreshed.length) person = rowToPerson(refreshed[0]);
      }
    }

    return person;
  } catch (err) {
    console.error("findOrCreatePerson error:", err);
    return null;
  }
}

export async function ensurePersonRoles(personId: string, roles: PersonRole[]): Promise<PersonRole[] | null> {
  try {
    if (!roles.length) return null;
    const rows = await db.query<{ roles: string[] | string }>("SELECT roles FROM public.people WHERE id = $1", [personId]);
    if (!rows.length) return null;
    const current = parseRoles(rows[0].roles);
    const merged = Array.from(new Set<PersonRole>([...current, ...roles]));
    if (merged.length === current.length) return current;
    await db.query("UPDATE public.people SET roles = $2::jsonb, updated_at = now() WHERE id = $1", [
      personId,
      JSON.stringify(merged),
    ]);
    return merged;
  } catch (err) {
    console.error("ensurePersonRoles error:", err);
    return null;
  }
}

export async function upsertPersonRecord(
  personId: string,
  kind: PersonRecordKind,
  opts: { refId?: string; refTitle?: string; status?: string; meta?: Record<string, unknown> } = {}
): Promise<PersonRecord | null> {
  try {
    const id = `rec-${crypto.randomUUID()}`;
    const rows = await db.query<PersonRecordDbRow>(
      `INSERT INTO public.person_records (id, person_id, kind, ref_id, ref_title, status, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) RETURNING *`,
      [id, personId, kind, opts.refId || "", opts.refTitle || "", opts.status || "pending", JSON.stringify(opts.meta || {})]
    );
    return rows.length ? rowToRecord(rows[0]) : null;
  } catch (err) {
    console.error("upsertPersonRecord error:", err);
    return null;
  }
}

interface PersonRowDb extends PersonDbRow {
  record_count: number | string;
  is_admin: boolean | string;
}

async function fetchPeopleRows(): Promise<PersonRow[]> {
  const rows = await db.query<PersonRowDb>(
    `SELECT p.id, p.first_name, p.last_name, p.email, p.phone, p.roles, p.notes, p.created_at, p.updated_at,
            COUNT(pr.id)::int AS record_count,
            EXISTS (SELECT 1 FROM public.admin_users au WHERE au.email IS NOT NULL AND LOWER(au.email) = LOWER(p.email)) AS is_admin
     FROM public.people p
     LEFT JOIN public.person_records pr ON pr.person_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return rows.map((r) => {
    const person = rowToPerson(r);
    if (r.is_admin && !person.roles.includes("admin")) person.roles = [...person.roles, "admin"];
    return { ...person, recordCount: Number(r.record_count ?? 0) };
  });
}

export async function getPeople(): Promise<PersonRow[]> {
  await requirePermission("manage_people");
  return fetchPeopleRows();
}

export async function getPerson(
  id: string
): Promise<{ person: Person; records: PersonRecord[]; isAdmin: boolean } | null> {
  await requirePermission("manage_people");
  const rows = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [id]);
  if (!rows.length) return null;
  const recRows = await db.query<PersonRecordDbRow>(
    "SELECT * FROM public.person_records WHERE person_id = $1 ORDER BY created_at DESC",
    [id]
  );
  const adminRows = await db.query<{ id: string }>("SELECT id FROM public.admin_users WHERE LOWER(email) = LOWER($1)", [
    rows[0].email,
  ]);
  const isAdmin = adminRows.length > 0;
  const person = rowToPerson(rows[0]);
  if (isAdmin && !person.roles.includes("admin")) person.roles = [...person.roles, "admin"];
  return { person, records: recRows.map(rowToRecord), isAdmin };
}

export async function exportPeople(): Promise<PersonRow[]> {
  await requirePermission("export_data");
  return fetchPeopleRows();
}

const kindLabelMap: Record<string, string> = {
  member: "Membership",
  volunteer: "Volunteer",
  partner: "Partnership",
  program: "School Chapter",
};

export async function applyAsPerson(opts: {
  kind: "member" | "volunteer" | "partner" | "program";
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  privacy?: boolean;
  marketing?: boolean;
  answers?: Record<string, unknown>;
  [HONEYPOT_FIELD]?: string;
}): Promise<{ error?: string; emailSent?: boolean; emailError?: string; kindLabel?: string }> {
  const guard = await assertSafe(`apply:${opts.kind}`, opts.email, await getClientIp(), opts as Record<string, unknown>);
  if (guard.error) return { error: guard.error };
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  if (!opts.name?.trim()) {
    return { error: "Name required" };
  }
  if (!opts.privacy) {
    return { error: "Please accept the privacy policy to continue" };
  }
  await recordSubmission(`apply:${opts.kind}`, opts.email, await getClientIp());
  const person = await findOrCreatePerson({ firstName: opts.name, email: opts.email, phone: opts.phone });
  if (!person) return { error: "Something went wrong. Try again." };

  const roleMap: Record<string, PersonRole[]> = {
    member: ["member"],
    volunteer: ["volunteer"],
    partner: ["partner contact"],
    program: ["applicant"],
  };
  const kindMap: Record<string, PersonRecordKind> = {
    member: "member",
    volunteer: "volunteer",
    partner: "partner",
    program: "program",
  };
  const kindLabel = kindLabelMap[opts.kind] || "BMAC";

  try {
    await recordConsent(
      person.id,
      { privacy: opts.privacy, marketing: opts.marketing, contact: true },
      "get-involved"
    );
    await ensurePersonRoles(person.id, roleMap[opts.kind] || []);
  } catch (err) {
    console.error("applyAsPerson consent/roles error:", err);
  }

  let record: PersonRecord | null = null;
  try {
    record = await upsertPersonRecord(person.id, kindMap[opts.kind] || "program", {
      status: "pending",
      meta: opts.notes ? { notes: opts.notes.slice(0, 500) } : {},
    });
  } catch (err) {
    console.error("applyAsPerson upsertPersonRecord error:", err);
  }

  const workflowKindMap: Record<string, WorkflowKind> = {
    member: "member",
    volunteer: "volunteer",
    partner: "partner",
    program: "program",
  };

  let formSubmissionId = "";
  const entityTypeForForm: Record<string, string> = {
    member: "member",
    volunteer: "volunteer",
    partner: "partner",
    program: "program",
  };
  try {
    const submitted = await submitForm(entityTypeForForm[opts.kind] || "member", null, opts.answers || {
      name: opts.name.trim(),
      email: person.email,
      phone: opts.phone || "",
      notes: opts.notes ? opts.notes.slice(0, 500) : "",
      consent_privacy: Boolean(opts.privacy),
      consent_marketing: Boolean(opts.marketing),
    }, person.id);
    if (submitted?.id) formSubmissionId = submitted.id;
  } catch (err) {
    console.error("applyAsPerson submitForm error:", err);
  }

  try {
    await createWorkflowRecord({
      kind: workflowKindMap[opts.kind] || "member",
      refId: person.id,
      title: `${kindLabel} application: ${opts.name.trim()}`,
      summary: `${opts.name.trim()} submitted a ${kindLabel} application.`,
      status: "open",
      priority: "normal",
      submitterName: opts.name.trim(),
      submitterEmail: person.email,
      source: "get-involved",
      details: {
        personRecordId: record?.id || "",
        phone: opts.phone || "",
        notes: opts.notes ? opts.notes.slice(0, 500) : "",
        formSubmissionId,
        consent: {
          privacy: Boolean(opts.privacy),
          marketing: Boolean(opts.marketing),
        },
      },
    });
  } catch (err) {
    console.error("applyAsPerson createWorkflowRecord error:", err);
  }

  let emailSent = false;
  let emailError = "";
  if (record) {
    const sent = await sendApplicationReceivedEmail({
      email: person.email,
      firstName: person.firstName,
      kindLabel,
    });
    emailSent = !sent.error;
    if (sent.error) {
      emailError = sent.error;
      console.error("application-received email error:", sent.error);
    }
    try {
      await db.query(
        "UPDATE public.person_records SET meta = jsonb_set(meta, '{confirmation_sent_at}', to_jsonb($2::text), true) WHERE id = $1",
        [record.id, new Date().toISOString()]
      );
    } catch (err) {
      console.error("store confirmation_sent_at error:", err);
    }
  }

  try {
    await createAdminNotification({
      title: "New application received",
      message: `${opts.name.trim()} submitted a ${kindLabel} application (${person.email}).`,
      type: "form_submission",
      link: "/admin/inbox",
    });
  } catch (err) {
    console.error("applyAsPerson createAdminNotification error:", err);
  }

  return { emailSent, emailError, kindLabel };
}

export async function anonymizePerson(
  personId: string
): Promise<{ error?: string; person?: Person }> {
  await requirePermission("manage_people");
  const rows = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [personId]);
  if (!rows.length) return { error: "Person not found" };
  const person = rowToPerson(rows[0]);

  const adminRows = await db.query<{ id: string }>(
    "SELECT id FROM public.admin_users WHERE LOWER(email) = LOWER($1)",
    [person.email]
  );
  if (adminRows.length) {
    return { error: "Admin accounts cannot be anonymized. Remove admin access first." };
  }

  await db.query(
    `UPDATE public.people
     SET first_name = 'Deleted', last_name = 'User', email = $2, phone = '',
         notes = '[deleted per request]', consent = '{}'::jsonb, roles = '[]'::jsonb,
         updated_at = now()
     WHERE id = $1`,
    [personId, `deleted-${personId.replace(/[^a-zA-Z0-9]/g, "")}@anon.local`]
  );

  await logActivity("system", "person_anonymize", "people", {
    resourceId: personId,
    details: `Anonymized person record ${personId}`,
  });

  const refreshed = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [personId]);
  return refreshed.length ? { person: rowToPerson(refreshed[0]) } : { person };
}

export interface PersonInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: PersonRole[];
  notes?: string;
}

export async function createPerson(input: PersonInput): Promise<{ error?: string; person?: Person }> {
  const admin = await requirePermission("manage_people");
  const firstName = (input.firstName || "").trim();
  const lastName = (input.lastName || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phone = (input.phone || "").trim();
  const notes = (input.notes || "").trim();
  const roles = Array.isArray(input.roles) ? input.roles : [];

  if (!firstName) return { error: "First name is required" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Valid email required" };

  const emailCheck = email
    ? await db.query<PersonDbRow>("SELECT id FROM public.people WHERE lower(email) = $1", [email]).catch(() => [])
    : [];
  if (emailCheck.length) return { error: "A person with this email already exists" };

  const id = `person-${crypto.randomUUID()}`;
  try {
    await db.query(
      `INSERT INTO public.people (id, first_name, last_name, email, phone, roles, notes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [id, firstName, lastName, email, phone, JSON.stringify(roles), notes]
    );
  } catch (err) {
    console.error("createPerson error:", err);
    return { error: "Failed to create person" };
  }

  const rows = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [id]);
  const person = rows.length ? rowToPerson(rows[0]) : null;
  if (person) {
    await logActivity(admin.email, "person_create", "people", {
      resourceId: id,
      details: `Created person: ${firstName} ${lastName} <${email || "no email"}>`,
    });
  }
  return person ? { person } : { error: "Failed to create person" };
}

export async function updatePerson(
  personId: string,
  input: PersonInput
): Promise<{ error?: string; person?: Person }> {
  const admin = await requirePermission("manage_people");
  const rows = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [personId]);
  if (!rows.length) return { error: "Person not found" };
  const current = rowToPerson(rows[0]);

  const firstName = input.firstName?.trim() ?? current.firstName;
  const lastName = input.lastName?.trim() ?? current.lastName;
  const email = input.email?.trim().toLowerCase() ?? current.email;
  const phone = input.phone?.trim() ?? current.phone;
  const notes = input.notes?.trim() ?? current.notes;
  const roles = Array.isArray(input.roles) ? input.roles : current.roles;

  if (!firstName) return { error: "First name is required" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Valid email required" };

  if (email.toLowerCase() !== current.email.toLowerCase()) {
    const dup = await db.query<PersonDbRow>("SELECT id FROM public.people WHERE lower(email) = $1 AND id <> $2", [
      email.toLowerCase(),
      personId,
    ]).catch(() => []);
    if (dup.length) return { error: "A person with this email already exists" };
  }

  try {
    await db.query(
      `UPDATE public.people
       SET first_name = $1, last_name = $2, email = $3, phone = $4, roles = $5::jsonb, notes = $6, updated_at = now()
       WHERE id = $7`,
      [firstName, lastName, email, phone, JSON.stringify(roles), notes, personId]
    );
  } catch (err) {
    console.error("updatePerson error:", err);
    return { error: "Failed to update person" };
  }

  const refreshed = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [personId]);
  const person = refreshed.length ? rowToPerson(refreshed[0]) : null;
  if (person) {
    await logActivity(admin.email, "person_update", "people", {
      resourceId: personId,
      details: `Updated person: ${firstName} ${lastName}`,
    });
  }
  return person ? { person } : { error: "Failed to update person" };
}

export async function deletePerson(
  personId: string
): Promise<{ error?: string; success?: boolean }> {
  const admin = await requirePermission("manage_people");
  const rows = await db.query<PersonDbRow>("SELECT * FROM public.people WHERE id = $1", [personId]);
  if (!rows.length) return { error: "Person not found" };
  const person = rowToPerson(rows[0]);

  if (person.email) {
    const adminRows = await db.query<{ id: string }>(
      "SELECT id FROM public.admin_users WHERE LOWER(email) = LOWER($1)",
      [person.email]
    );
    if (adminRows.length) {
      return { error: "Admin accounts cannot be deleted. Remove admin access first." };
    }
  }

  try {
    await db.remove("people", personId);
  } catch (err) {
    console.error("deletePerson error:", err);
    return { error: "Failed to delete person" };
  }

  await logActivity(admin.email, "person_delete", "people", {
    resourceId: personId,
    details: `Deleted person: ${person.firstName} ${person.lastName}`,
  });
  return { success: true };
}
