import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requirePermission("manage_programs");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const applications = await db.query<{
      id: string;
      program_title: string;
      applicant_name: string;
      applicant_email: string;
      status: string;
      created_at: string;
    }>(
      `SELECT 
        pa.id,
        pr.title AS program_title,
        p.first_name || ' ' || p.last_name AS applicant_name,
        p.email AS applicant_email,
        pa.status,
        pa.created_at
       FROM program_applications pa
       JOIN programs pr ON pr.id = pa.program_id
       JOIN people p ON p.id = pa.person_id
       WHERE pa.status IN ('submitted', 'in_review')
       ORDER BY pa.created_at DESC
       LIMIT 10`
    );

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
