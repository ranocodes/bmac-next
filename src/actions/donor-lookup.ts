import { db } from "@/lib/db";
import { assertSafe, getClientIp, recordSubmission } from "@/lib/spam-guard";

export interface DonorLookupResult {
  reference: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: string;
  receiptUrl: string;
}

export async function lookupDonations(email: string): Promise<{ error?: string; donations?: DonorLookupResult[] }> {
  const guard = await assertSafe("donor-lookup", email, await getClientIp());
  if (guard.error) return { error: guard.error };

  const clean = (email || "").trim().toLowerCase();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { error: "Valid email required" };
  }
  if (clean.length > 254) return { error: "Email too long" };

  try {
    await recordSubmission("donor-lookup", clean, await getClientIp());
    const rows = await db.query<{
      ref_id: string;
      name: string;
      email: string;
      amount: number;
      currency: string;
      created_at: string;
      status: string;
    }>(
      `SELECT pr.ref_id, COALESCE(p.first_name || ' ' || p.last_name, pr.ref_title) AS name,
              COALESCE(p.email, '') AS email,
              COALESCE((pr.meta->>'amount')::numeric, 0)::int AS amount,
              COALESCE(pr.meta->>'currency', 'NGN') AS currency,
              pr.created_at, pr.status
       FROM public.person_records pr
       LEFT JOIN public.people p ON p.id = pr.person_id
       WHERE pr.kind = 'donation' AND LOWER(COALESCE(p.email, '')) = LOWER($1)
       ORDER BY pr.created_at DESC`,
      [clean]
    );
    return {
      donations: rows.map(r => ({
        reference: r.ref_id || "",
        name: (r.name || "").trim() || "Donor",
        email: r.email,
        amount: Number(r.amount ?? 0),
        currency: r.currency,
        createdAt: r.created_at,
        status: r.status,
        receiptUrl: `/api/receipts/${encodeURIComponent(r.ref_id || "")}`,
      })),
    };
  } catch (err) {
    console.error("lookupDonations error:", err);
    return { error: "Something went wrong. Try again." };
  }
}
