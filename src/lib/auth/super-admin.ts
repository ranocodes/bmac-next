import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const COOKIE_NAME = "bmac_admin_session";

export interface SuperAdminSession {
  email: string;
  role: "super_admin";
  createdAt: number;
}

interface SuperAdminRow {
  id: string;
  email: string;
  password_hash: string;
}

function getSecret(): string {
  const secret = process.env.SUPER_ADMIN_COOKIE_SECRET;
  if (!secret) throw new Error("SUPER_ADMIN_COOKIE_SECRET not set");
  return secret;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const sigBytes = Uint8Array.from(
    (signature.match(/.{1,2}/g) || []).map(b => parseInt(b, 16)));
  if (sigBytes.length === 0) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data));
}

export async function verifySuperAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!email || !password) return false;

  try {
    const rows = await db.query<SuperAdminRow>(
      "SELECT id, email, password_hash FROM public.super_admins WHERE LOWER(email) = LOWER($1)", [email]);
    if (rows.length > 0) return bcrypt.compareSync(password, rows[0].password_hash);
  } catch { /* fall through */ }

  return false;
}

export async function getSuperAdminCount(): Promise<number> {
  try {
    const rows = await db.query<{ count: number }>("SELECT COUNT(*) AS count FROM public.super_admins");
    return Number(rows[0]?.count ?? 0);
  } catch { return 0; }
}

export async function registerFirstAdmin(email: string, password: string): Promise<{ error?: string }> {
  const count = await getSuperAdminCount();
  if (count > 0) return { error: "Super admin already exists" };
  const hash = bcrypt.hashSync(password, 12);
  try {
    await db.query("INSERT INTO public.super_admins (email, password_hash) VALUES ($1, $2)", [email.toLowerCase(), hash]);
    await setSuperAdminSession(email);
    return {};
  } catch (e: any) {
    return { error: e?.message || "Failed to create admin" };
  }
}

export async function createInvite(email: string, createdById: string): Promise<{ token?: string; error?: string }> {
  const payload = JSON.stringify({ email: email.toLowerCase(), expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const payloadB64 = Buffer.from(payload).toString("base64");
  const sig = await hmacSign(payloadB64, getSecret());
  const token = `${payloadB64}.${sig}`;

  try {
    await db.query(
      "INSERT INTO public.admin_invites (email, token, created_by_id, expires_at) VALUES ($1, $2, $3, now() + interval '7 days')",
      [email.toLowerCase(), token, createdById]);
    return { token };
  } catch (e: any) {
    return { error: e?.message || "Failed to create invite" };
  }
}

export async function getInviteByToken(token: string): Promise<{ email: string; valid: boolean; error?: string }> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return { email: "", valid: false, error: "Invalid token" };

  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const validSig = await hmacVerify(payloadB64, sig, getSecret());
  if (!validSig) return { email: "", valid: false, error: "Invalid signature" };

  let payload: { email: string; expiresAt: number };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
  } catch {
    return { email: "", valid: false, error: "Invalid payload" };
  }

  if (Date.now() > payload.expiresAt) return { email: "", valid: false, error: "Invite expired" };

  try {
    const rows = await db.query<{ used_at: string | null }>(
      "SELECT used_at FROM public.admin_invites WHERE token = $1", [token]);
    if (rows.length === 0) return { email: "", valid: false, error: "Invite not found" };
    if (rows[0].used_at) return { email: "", valid: false, error: "Invite already used" };
    return { email: payload.email, valid: true };
  } catch {
    return { email: "", valid: false, error: "DB error" };
  }
}

export async function acceptInvite(token: string, password: string): Promise<{ error?: string }> {
  const invite = await getInviteByToken(token);
  if (!invite.valid) return { error: invite.error || "Invalid invite" };

  const hash = bcrypt.hashSync(password, 12);
  try {
    const inviteRows = await db.query<{ created_by_id: string }>(
      "SELECT created_by_id FROM public.admin_invites WHERE token = $1", [token]);
    if (inviteRows.length === 0) return { error: "Invite not found" };

    await db.query(
      "INSERT INTO public.super_admins (email, password_hash, created_by_id) VALUES ($1, $2, $3)",
      [invite.email, hash, inviteRows[0].created_by_id]);
    await db.query("UPDATE public.admin_invites SET used_at = now() WHERE token = $1", [token]);

    await setSuperAdminSession(invite.email);
    return {};
  } catch (e: any) {
    return { error: e?.message || "Failed to accept invite" };
  }
}

export async function setSuperAdminSession(email: string) {
  const cookie = await cookies();
  const payload = JSON.stringify({ email, role: "super_admin", createdAt: Date.now() });
  const payloadB64 = Buffer.from(payload).toString("base64");
  const sig = await hmacSign(payloadB64, getSecret());
  cookie.set(COOKIE_NAME, `${payloadB64}.${sig}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/admin", maxAge: 60 * 60 * 24,
  });
}

export async function getSuperAdminSession(): Promise<SuperAdminSession | null> {
  const cookie = await cookies();
  const raw = cookie.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const dot = raw.lastIndexOf(".");
  if (dot === -1) return null;

  const payloadB64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);

  const valid = await hmacVerify(payloadB64, sig, getSecret());
  if (!valid) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
    if (payload.role !== "super_admin") return null;
    return payload as SuperAdminSession;
  } catch { return null; }
}

export async function clearSuperAdminSession() {
  const cookie = await cookies();
  cookie.delete(COOKIE_NAME);
}
