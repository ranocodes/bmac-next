"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "./activity-logs";
import { sendFormSubmitAlertEmail, sendGoogleFormLinkEmail } from "@/lib/email";
import { createAdminNotification, getSuperAdminEmails } from "@/lib/notifications";
import { createWorkflowRecord } from "@/lib/workflows";
import { recordConsent } from "@/lib/consent";
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
      const inserted = await db.query<PersonDbRow>(reselect.q, reselect.p);
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

export async function registerForFreeEvent(opts: {
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
}): Promise<{ error?: string }> {
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  const person = await findOrCreatePerson({ firstName: opts.name, email: opts.email });
  if (!person) return { error: "Something went wrong. Try again." };
  await ensurePersonRoles(person.id, ["attendee"]);
  await upsertPersonRecord(person.id, "event_registration", {
    refId: opts.eventId,
    refTitle: opts.eventTitle,
    status: "confirmed",
  });
  return {};
}

const kindLabelMap: Record<string, string> = {
  member: "Membership",
  volunteer: "Volunteer",
  partner: "Partnership",
  program: "School Chapter",
};

const formKeyMap: Record<string, string> = {
  member: "join",
  volunteer: "volunteer",
  partner: "partner",
  program: "school",
};

async function getConfiguredFormLink(key: string): Promise<string> {
  try {
    const rows = await db.query<{ google_forms: Record<string, string> }>(
      "SELECT google_forms FROM public.site_settings LIMIT 1"
    );
    return rows[0]?.google_forms?.[key] || "";
  } catch (err) {
    console.error("getConfiguredFormLink error:", err);
    return "";
  }
}

export async function applyAsPerson(opts: {
  kind: "member" | "volunteer" | "partner" | "program";
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  privacy?: boolean;
  marketing?: boolean;
}): Promise<{ error?: string; formLink?: string; emailSent?: boolean; emailError?: string; kindLabel?: string }> {
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  if (!opts.name?.trim()) {
    return { error: "Name required" };
  }
  if (!opts.privacy) {
    return { error: "Please accept the privacy policy to continue" };
  }
  const person = await findOrCreatePerson({ firstName: opts.name, email: opts.email, phone: opts.phone });
  if (!person) return { error: "Something went wrong. Try again." };
  await recordConsent(
    person.id,
    { privacy: opts.privacy, marketing: opts.marketing, contact: true },
    "get-involved"
  );

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

  await ensurePersonRoles(person.id, roleMap[opts.kind] || []);
  const record = await upsertPersonRecord(person.id, kindMap[opts.kind] || "program", {
    status: "pending",
    meta: opts.notes ? { notes: opts.notes.slice(0, 500) } : {},
  });
  const workflowKindMap: Record<string, WorkflowKind> = {
    member: "member",
    volunteer: "volunteer",
    partner: "partner",
    program: "program",
  };
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
      consent: {
        privacy: Boolean(opts.privacy),
        marketing: Boolean(opts.marketing),
      },
    },
  });

  let formLink = "";
  let emailSent = false;
  let emailError = "";
  formLink = await getConfiguredFormLink(formKeyMap[opts.kind] || "join");
  if (record && formLink) {
    const sent = await sendGoogleFormLinkEmail({
      email: person.email,
      firstName: person.firstName,
      kindLabel,
      formLink,
    });
    emailSent = !sent.error;
    if (sent.error) {
      emailError = sent.error;
      console.error("google-forms-link email error:", sent.error);
    }
    try {
      await db.query(
        "UPDATE public.person_records SET meta = jsonb_set(meta, '{form_link_sent_at}', to_jsonb($2::text), true) WHERE id = $1",
        [record.id, new Date().toISOString()]
      );
    } catch (err) {
      console.error("store form_link_sent_at error:", err);
    }
  } else if (!formLink) {
    await createAdminNotification({
      title: "Google Form link missing",
      message: `${kindLabel} applications have no configured Google Form link — applicants cannot proceed past this step.`,
      type: "config",
      link: "/admin/settings",
    });
  }

  const adminEmails = await getSuperAdminEmails();
  await Promise.all(
    adminEmails.map(adminEmail =>
      sendFormSubmitAlertEmail({
        email: adminEmail,
        submitterName: opts.name.trim(),
        submitterEmail: person.email,
        kindLabel,
      }).catch(() => ({ error: "alert email failed" }))
    )
  );
  await createAdminNotification({
    title: "New application received",
    message: `${opts.name.trim()} submitted a ${kindLabel} application (${person.email}).`,
    type: "form_submission",
    link: "/admin/inbox",
  });

  return { formLink, emailSent, emailError, kindLabel };
}

export async function resendGoogleFormLink(opts: {
  kind: "member" | "volunteer" | "partner" | "program";
  email: string;
}): Promise<{ error?: string; formLink?: string; emailSent?: boolean }> {
  if (!opts.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.email)) {
    return { error: "Valid email required" };
  }
  const email = opts.email.trim().toLowerCase();
  const kindMap: Record<string, PersonRecordKind> = {
    member: "member",
    volunteer: "volunteer",
    partner: "partner",
    program: "program",
  };
  const recordKind = kindMap[opts.kind] || "program";

  const personRows = await db.query<PersonDbRow>(
    "SELECT * FROM public.people WHERE lower(email) = $1",
    [email]
  );
  if (!personRows.length) return { error: "No application found for this email." };
  const person = rowToPerson(personRows[0]);

  const recRows = await db.query<PersonRecordDbRow>(
    "SELECT * FROM public.person_records WHERE person_id = $1 AND kind = $2 ORDER BY created_at DESC LIMIT 1",
    [person.id, recordKind]
  );
  if (!recRows.length) return { error: "No application found for this email." };
  const record = rowToRecord(recRows[0]);

  const lastSent = record.meta?.form_link_sent_at as string | undefined;
  if (lastSent && Date.now() - new Date(lastSent).getTime() < 60_000) {
    return { error: "Link already sent recently. Check your inbox, or try again in a minute." };
  }

  const formLink = await getConfiguredFormLink(formKeyMap[opts.kind] || "join");
  if (!formLink) return { error: "No form link configured yet. Please try again later." };

  const sent = await sendGoogleFormLinkEmail({
    email: person.email,
    firstName: person.firstName,
    kindLabel: kindLabelMap[opts.kind] || "BMAC",
    formLink,
  });
  if (sent.error) return { error: "Could not send the email. Please try again." };

  try {
    await db.query(
      "UPDATE public.person_records SET meta = jsonb_set(meta, '{form_link_sent_at}', to_jsonb($2::text), true) WHERE id = $1",
      [record.id, new Date().toISOString()]
    );
  } catch (err) {
    console.error("store form_link_sent_at error:", err);
  }
  return { formLink, emailSent: true };
}
