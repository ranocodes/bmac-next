import { db } from "@/lib/db";

export interface ConsentInput {
  marketing?: boolean;
  contact?: boolean;
  privacy?: boolean;
}

export interface ConsentSnapshot {
  marketing: boolean;
  contact: boolean;
  privacy: boolean;
  acceptedAt: string;
  source: string;
}

export async function recordConsent(
  personId: string,
  consent: ConsentInput,
  source: string
): Promise<boolean> {
  try {
    const payload: ConsentSnapshot = {
      marketing: Boolean(consent.marketing),
      contact: Boolean(consent.contact),
      privacy: Boolean(consent.privacy),
      acceptedAt: new Date().toISOString(),
      source,
    };
    const rows = await db.query(
      "UPDATE public.people SET consent = $2::jsonb, updated_at = now() WHERE id = $1 RETURNING id",
      [personId, JSON.stringify(payload)]
    );
    return rows.length > 0;
  } catch (err) {
    console.error("recordConsent error:", err);
    return false;
  }
}

export async function getConsent(
  personId: string
): Promise<ConsentSnapshot | null> {
  try {
    const rows = await db.query<{ consent: unknown }>(
      "SELECT consent FROM public.people WHERE id = $1",
      [personId]
    );
    if (!rows.length) return null;
    const raw = rows[0].consent;
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as ConsentSnapshot;
      } catch {
        return null;
      }
    }
    return raw as ConsentSnapshot;
  } catch {
    return null;
  }
}

export function requirePrivacyConsent(accepted: string | boolean | null): string | null {
  const ok = accepted === true || accepted === "on" || accepted === "true";
  return ok ? null : "Please accept the privacy policy to continue";
}

export function parseFormConsent(
  formData: FormData
): { privacy: boolean; marketing: boolean } {
  const raw = formData.get("privacy");
  const marketing = formData.get("marketing");
  const str = typeof raw === "string" ? raw : String(raw ?? "");
  const marketingStr = typeof marketing === "string" ? marketing : String(marketing ?? "");
  const privacy = str === "on" || str === "true" || str === "1";
  return { privacy, marketing: marketingStr === "on" || marketingStr === "true" };
}
