"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { ADMIN_FORM_TYPES, FORM_TYPE_ALIASES } from "@/lib/form-constants";
import type { FormDefinition, FormQuestion, FormSubmission } from "@/types/cms";

export type AdminFormType = (typeof ADMIN_FORM_TYPES)[number];

function normalizeEntityType(entityType: string): string {
  return FORM_TYPE_ALIASES[entityType] || entityType;
}

function question(
  id: string,
  type: FormQuestion["type"],
  label: string,
  placeholder = "",
  required = false,
  order = 0,
  options: string[] = []
): FormQuestion {
  return { id, type, label, placeholder, required, order, options };
}

export async function getDefaultFormQuestions(entityType: string): Promise<FormQuestion[]> {
  const normalized = normalizeEntityType(entityType);
  const base = [
    question("name", "text", "Full Name", "e.g. Amina Yusuf", true, 0),
    question("email", "email", "Email Address", "you@example.com", true, 1),
    question("phone", "phone", "Phone (WhatsApp)", "e.g. +234 803 456 7891", false, 2),
  ];

  if (normalized === "volunteer") {
    return [
      ...base,
      question("availability", "select", "Availability", "Select availability", true, 3, [
        "Weekdays",
        "Weekends",
        "Flexible",
      ]),
      question("skills", "textarea", "What skills or experience can you contribute?", "Tell us about facilitation, mentoring, events, media, operations, or other strengths.", true, 4),
      question("motivation", "textarea", "Why would you like to volunteer with BMAC?", "Share your motivation and what kind of impact you want to make.", true, 5),
    ];
  }

  if (normalized === "partner") {
    return [
      ...base,
      question("organization", "text", "Organization Name", "Your school, company, NGO, or group", true, 3),
      question("partnership_type", "select", "Partnership Type", "Select partnership type", true, 4, [
        "School chapter",
        "Program sponsorship",
        "Training collaboration",
        "Venue or resource support",
        "Other",
      ]),
      question("proposal", "textarea", "How would you like to partner with BMAC?", "Briefly describe the opportunity or support you have in mind.", true, 5),
    ];
  }

  if (normalized === "program") {
    return [
      ...base,
      question("motivation", "textarea", "Why do you want to join?", "Tell us a little about yourself and why this program matters to you.", true, 3),
    ];
  }

  return [
    ...base,
    question("motivation", "textarea", "Why would you like to join BMAC?", "Tell us about your motivation and what you hope to contribute.", true, 3),
  ];
}

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
  const normalized = normalizeEntityType(entityType);
  const rows = await db.query<FormDefDbRow>(
    `SELECT * FROM public.form_definitions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
    [normalized, entityId ?? ""]
  );
  if (rows.length) return rowToFormDefinition(rows[0]);
  if (normalized !== entityType) {
    const legacyRows = await db.query<FormDefDbRow>(
      `SELECT * FROM public.form_definitions
       WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
      [entityType, entityId ?? ""]
    );
    if (legacyRows.length) return rowToFormDefinition(legacyRows[0]);
  }
  return null;
}

export async function getFormDefinitionOrDefault(
  entityType: string,
  entityId?: string
): Promise<FormDefinition> {
  const normalized = normalizeEntityType(entityType);
  const existing = await getFormDefinition(normalized, entityId);
  if (existing && existing.questions.length > 0) return existing;
  return {
    id: `default-${normalized}${entityId ? `-${entityId}` : ""}`,
    entityType: normalized,
    entityId,
    questions: await getDefaultFormQuestions(normalized),
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

export async function upsertFormDefinition(
  entityType: string,
  entityId: string | null,
  questions: FormQuestion[]
): Promise<FormDefinition> {
  const normalized = normalizeEntityType(entityType);
  const existing = await db.query<FormDefDbRow>(
    `SELECT id FROM public.form_definitions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
    [normalized, entityId ?? ""]
  );

  if (existing.length) {
    const rows = await db.query<FormDefDbRow>(
      `UPDATE public.form_definitions
       SET questions = $3::jsonb, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [existing[0].id, normalized, JSON.stringify(questions)]
    );
    return rowToFormDefinition(rows[0]);
  }

  const id = genId("formdef");
  const rows = await db.query<FormDefDbRow>(
    `INSERT INTO public.form_definitions (id, entity_type, entity_id, questions)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING *`,
    [id, normalized, entityId, JSON.stringify(questions)]
  );
  return rowToFormDefinition(rows[0]);
}

export async function deleteFormDefinition(
  entityType: string,
  entityId?: string
): Promise<void> {
  const normalized = normalizeEntityType(entityType);
  await db.query(
    `DELETE FROM public.form_definitions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')`,
    [normalized, entityId ?? ""]
  );
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

export async function getFormSubmissions(
  entityType: string,
  entityId?: string
): Promise<FormSubmission[]> {
  const normalized = normalizeEntityType(entityType);
  const rows = await db.query<FormSubmissionDbRow>(
    `SELECT * FROM public.form_submissions
     WHERE entity_type = $1 AND COALESCE(entity_id, '') = COALESCE($2, '')
     ORDER BY created_at DESC`,
    [normalized, entityId ?? ""]
  );
  return rows.map(rowToFormSubmission);
}

export async function getFormSubmissionById(id: string): Promise<FormSubmission | null> {
  const rows = await db.query<FormSubmissionDbRow>(
    `SELECT * FROM public.form_submissions WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows.length ? rowToFormSubmission(rows[0]) : null;
}

export async function getLatestFormSubmission(input: {
  entityType: string;
  entityId?: string | null;
  personId?: string | null;
}): Promise<FormSubmission | null> {
  const normalized = normalizeEntityType(input.entityType);
  const rows = await db.query<FormSubmissionDbRow>(
    `SELECT * FROM public.form_submissions
     WHERE entity_type = $1
       AND COALESCE(entity_id, '') = COALESCE($2, '')
       AND COALESCE(person_id, '') = COALESCE($3, '')
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalized, input.entityId ?? "", input.personId ?? ""]
  );
  return rows.length ? rowToFormSubmission(rows[0]) : null;
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
