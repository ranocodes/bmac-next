import crypto from "crypto";
import { db } from "@/lib/db";
import { logActivity } from "@/actions/activity-logs";
import type { Person, PersonRecord, PersonRecordKind, PersonRole } from "@/types/cms";

export interface PersonDbRow {
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

export interface PersonRecordDbRow {
  id: string;
  person_id: string;
  kind: string;
  ref_id: string;
  ref_title: string;
  status: string;
  meta: Record<string, unknown> | string;
  created_at: string;
}

export function parseRoles(roles: string[] | string): PersonRole[] {
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

export function rowToPerson(row: PersonDbRow): Person {
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

export function rowToRecord(row: PersonRecordDbRow): PersonRecord {
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
