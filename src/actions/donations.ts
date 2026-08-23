"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { findOrCreatePerson, ensurePersonRoles, upsertPersonRecord } from "@/lib/people";
import { logActivity } from "./activity-logs";
import { assertSafe, getClientIp, recordSubmission, HONEYPOT_FIELD } from "@/lib/spam-guard";

export interface PendingDonation {
  personId: string;
  recordId: string;
  reference: string;
}

export async function createPendingDonation(opts: {
  name: string;
  email: string;
  amount: number;
  reference: string;
  [HONEYPOT_FIELD]?: string;
}): Promise<{ error?: string; donation?: PendingDonation }> {
  const guard = await assertSafe("donation", opts.email, await getClientIp(), opts as Record<string, unknown>);
  if (guard.error) return { error: guard.error };
  const email = (opts.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Valid email required" };
  }
  if (!opts.amount || opts.amount <= 0) {
    return { error: "Enter a valid amount" };
  }
  const reference = (opts.reference || "").trim();
  if (!reference) {
    return { error: "Missing payment reference" };
  }

  try {
    await recordSubmission("donation", email, await getClientIp());
    const person = await findOrCreatePerson({ firstName: opts.name, email });
    if (!person) return { error: "Something went wrong. Try again." };
    await ensurePersonRoles(person.id, ["donor"]);

    const record = await upsertPersonRecord(person.id, "donation", {
      refId: reference,
      refTitle: "Donation",
      status: "pending",
      meta: { amount: opts.amount, currency: "NGN", reference },
    });
    if (!record) return { error: "Could not create donation record" };

    await logActivity("system", "donation_initiated", "person_records", {
      resourceId: record.id,
      details: `Donation of ${opts.amount} initiated by ${email} (${reference})`,
    });

    return { donation: { personId: person.id, recordId: record.id, reference } };
  } catch (err) {
    console.error("createPendingDonation error:", err);
    return { error: "Failed to start donation" };
  }
}

export async function getDonations(): Promise<
  { id: string; personId: string; name: string; email: string; amount: number; status: string; reference: string; createdAt: string }[]
> {
  const rows = await db.query<{
    id: string;
    person_id: string;
    first_name: string;
    last_name: string;
    email: string;
    amount: number;
    status: string;
    ref_id: string;
    created_at: string;
  }>(
    `SELECT pr.id, pr.person_id, p.first_name, p.last_name, p.email,
            COALESCE((pr.meta->>'amount')::numeric, 0)::int AS amount,
            pr.status, pr.ref_id, pr.created_at
     FROM public.person_records pr
     LEFT JOIN public.people p ON p.id = pr.person_id
     WHERE pr.kind = 'donation'
     ORDER BY pr.created_at DESC`
  );
  return rows.map(r => ({
    id: r.id,
    personId: r.person_id,
    name: `${r.first_name || "Deleted"} ${r.last_name || "User"}`.trim(),
    email: r.email || "",
    amount: Number(r.amount ?? 0),
    status: r.status,
    reference: r.ref_id || "",
    createdAt: r.created_at,
  }));
}
