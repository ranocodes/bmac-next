import { db } from "@/lib/db";

export interface DonationTotals {
  totalKobo: number;
  totalNaira: number;
  count: number;
  goal: number;
}

export async function getDonationTotals(): Promise<DonationTotals> {
  const rows = await db.query<{
    total: string;
    count: string;
  }>(
    `SELECT COALESCE(SUM(COALESCE((meta->>'amount')::numeric, 0) * 100), 0) AS total,
            COUNT(*)::int AS count
     FROM public.person_records
     WHERE kind = 'donation' AND status = 'completed'`
  );
  const settings = await db.query<{ donation_goal: number }>(
    `SELECT donation_goal FROM public.site_settings ORDER BY id DESC LIMIT 1`
  );
  const totalKobo = Number(rows[0]?.total ?? 0);
  const dbGoal = Number(settings[0]?.donation_goal ?? 0);
  const envGoal = Number(process.env.DONATION_GOAL ?? 0);
  return {
    totalKobo,
    totalNaira: totalKobo / 100,
    count: Number(rows[0]?.count ?? 0),
    goal: dbGoal || envGoal,
  };
}

export async function getDonationRecordByReference(reference: string): Promise<{
  id: string;
  email: string;
  name: string;
  amount: number;
  currency: string;
  reference: string;
  createdAt: string;
  status: string;
} | null> {
  const rows = await db.query<{
    id: string;
    email: string;
    name: string;
    amount: number;
    currency: string;
    ref_id: string;
    created_at: string;
    status: string;
  }>(
    `SELECT pr.id, COALESCE(p.email, '') AS email,
            COALESCE(p.first_name || ' ' || p.last_name, pr.ref_title) AS name,
            COALESCE((pr.meta->>'amount')::numeric, 0)::int AS amount,
            COALESCE(pr.meta->>'currency', 'NGN') AS currency,
            pr.ref_id, pr.created_at, pr.status
     FROM public.person_records pr
     LEFT JOIN public.people p ON p.id = pr.person_id
     WHERE pr.kind = 'donation' AND pr.ref_id = $1
     LIMIT 1`,
    [reference]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    email: r.email,
    name: (r.name || "").trim() || "Donor",
    amount: Number(r.amount ?? 0),
    currency: r.currency,
    reference: r.ref_id || "",
    createdAt: r.created_at,
    status: r.status,
  };
}
