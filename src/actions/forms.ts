"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import type { FormDefinition, FormQuestion, FormSubmission } from "@/types/cms";

function genId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

interface FormDefDbRow {
  id: string;
  entity_type: string;
  entity_id: string | null;
  questions: FormQuestion[] | string;
  created_at: string;
  updated_at: string;
}

function rowToFormDefinition(row: FormDefDbRow): FormDefinition {
  let questions: FormQuestion[] = [];
  try {
    questions = typeof row.questions === "string" ? JSON.parse(row.questions) : (row.questions ?? []);
  } catch {
    questions = [];
  }
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    questions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

export async function getFormDefinition(
  entityType: string,
  entityId?: string
): Promise<FormDefinition | null> {
  const rows = await db.query<FormDefDbRow>(
    `SELECT * FROM public.form_definitions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
    [entityType, entityId ?? ""]
  );
  return rows.length ? rowToFormDefinition(rows[0]) : null;
}

export async function upsertFormDefinition(
  entityType: string,
  entityId: string | null,
  questions: FormQuestion[]
): Promise<FormDefinition> {
  const existing = await db.query<FormDefDbRow>(
    `SELECT id FROM public.form_definitions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
    [entityType, entityId ?? ""]
  );

  if (existing.length) {
    const rows = await db.query<FormDefDbRow>(
      `UPDATE public.form_definitions
       SET questions = $3::jsonb, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [existing[0].id, entityType, JSON.stringify(questions)]
    );
    return rowToFormDefinition(rows[0]);
  }

  const id = genId("formdef");
  const rows = await db.query<FormDefDbRow>(
    `INSERT INTO public.form_definitions (id, entity_type, entity_id, questions)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING *`,
    [id, entityType, entityId, JSON.stringify(questions)]
  );
  return rowToFormDefinition(rows[0]);
}

export async function deleteFormDefinition(
  entityType: string,
  entityId?: string
): Promise<void> {
  await db.query(
    `DELETE FROM public.form_definitions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
    [entityType, entityId ?? ""]
  );
}

export async function submitForm(
  entityType: string,
  entityId: string | null,
  answers: Record<string, unknown>,
  personId?: string
): Promise<FormSubmission | null> {
  try {
    const id = genId("formsub");
    const rows = await db.query<FormSubmissionDbRow>(
      `INSERT INTO public.form_submissions (id, entity_type, entity_id, person_id, answers)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [id, entityType, entityId, personId ?? null, JSON.stringify(answers)]
    );
    return rows.length ? rowToFormSubmission(rows[0]) : null;
  } catch (err) {
    console.error("submitForm error:", err);
    return null;
  }
}

export async function getFormSubmissions(
  entityType: string,
  entityId?: string
): Promise<FormSubmission[]> {
  const rows = await db.query<FormSubmissionDbRow>(
    `SELECT * FROM public.form_submissions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')
     ORDER BY created_at DESC`,
    [entityType, entityId ?? ""]
  );
  return rows.map(rowToFormSubmission);
}

export async function getAllPrograms(): Promise<{ id: string; title: string }[]> {
  return db.query<{ id: string; title: string }>(
    `SELECT id, title FROM public.programs ORDER BY created_at DESC`
  );
}

export async function getProgramTitle(programId: string): Promise<string | null> {
  const rows = await db.query<{ title: string }>(
    `SELECT title FROM public.programs WHERE id = $1`,
    [programId]
  );
  return rows[0]?.title ?? null;
}
