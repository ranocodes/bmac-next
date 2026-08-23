"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { FORM_TYPE_ALIASES } from "@/lib/form-constants";
import type { FormSubmission } from "@/types/cms";

function normalizeEntityType(entityType: string): string {
  return FORM_TYPE_ALIASES[entityType] || entityType;
}

function genId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

interface FormSubmissionDbRow {
  id: string;
  entity_type: string;
  entity_id: string | null;
  person_id: string | null;
  answers: Record<string, unknown> | string;
  created_at: string;
}

function rowToFormSubmission(row: FormSubmissionDbRow): FormSubmission {
  let answers: Record<string, unknown> = {};
  try {
    answers = typeof row.answers === "string" ? JSON.parse(row.answers) : (row.answers ?? {});
  } catch {
    answers = {};
  }
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    personId: row.person_id ?? undefined,
    answers,
    createdAt: row.created_at,
  };
}

export async function submitForm(
  entityType: string,
  entityId: string | null,
  answers: Record<string, unknown>,
  personId?: string
): Promise<FormSubmission | null> {
  try {
    const normalized = normalizeEntityType(entityType);
    const id = genId("formsub");
    const rows = await db.query<FormSubmissionDbRow>(
      `INSERT INTO public.form_submissions (id, entity_type, entity_id, person_id, answers)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [id, normalized, entityId, personId ?? null, JSON.stringify(answers)]
    );
    return rows.length ? rowToFormSubmission(rows[0]) : null;
  } catch (err) {
    console.error("submitForm error:", err);
    return null;
  }
}
