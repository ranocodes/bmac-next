"use server";

import { db } from "@/lib/db";

export interface InvolvementSection {
  title: string;
  content: string;
  icon: string;
}

export interface InvolvementPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  hero_description: string | null;
  icon: string | null;
  color: string | null;
  accent_color: string | null;
  sections: InvolvementSection[];
  benefits: string[];
  created_at: string;
  updated_at: string;
}

export async function getInvolvementPage(slug: string): Promise<InvolvementPage | null> {
  const rows = await db.query<any>(
    `SELECT * FROM public.involvement_pages WHERE slug = $1`,
    [slug]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    ...row,
    sections: typeof row.sections === "string" ? JSON.parse(row.sections) : (row.sections ?? []),
    benefits: typeof row.benefits === "string" ? JSON.parse(row.benefits) : (row.benefits ?? []),
  };
}

export async function getAllInvolvementPages(): Promise<InvolvementPage[]> {
  const rows = await db.query<any>(
    `SELECT * FROM public.involvement_pages ORDER BY created_at ASC`
  );
  return rows.map(row => ({
    ...row,
    sections: typeof row.sections === "string" ? JSON.parse(row.sections) : (row.sections ?? []),
    benefits: typeof row.benefits === "string" ? JSON.parse(row.benefits) : (row.benefits ?? []),
  }));
}
