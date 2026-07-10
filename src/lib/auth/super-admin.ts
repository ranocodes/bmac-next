import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import type { AdminRole, Permission } from "@/types/cms";

const COOKIE_NAME = "bmac_admin_session";

export const ALL_PERMISSIONS: Permission[] = [
  "manage_users", "edit_content", "manage_courses", "manage_partners",
  "view_analytics", "access_settings", "delete_records", "manage_moderators",
];

export interface SuperAdminSession {
  email: string;
  firstName: string;
  role: AdminRole;
  permissions: Permission[];
  createdAt: number;
}

interface SuperAdminRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
}

export interface AdminUserInfo {
  email: string;
  firstName: string;
  role: AdminRole;
  permissions: Permission[];
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

export async function verifySuperAdminCredentials(email: string, password: string): Promise<AdminUserInfo | null> {
  if (!email || !password) return null;

  try {
    const rows = await db.query<SuperAdminRow>(
      "SELECT id, email, password_hash, first_name FROM public.super_admins WHERE LOWER(email) = LOWER($1)", [email]);
    if (rows.length === 0) return null;
    if (!bcrypt.compareSync(password, rows[0].password_hash)) return null;

    const admin = rows[0];
    let role: AdminRole = "super_admin";
    let permissions: Permission[] = ALL_PERMISSIONS;
    try {
      const userRows = await db.query<{ role: string; permissions: Permission[] }>(
        "SELECT role, permissions FROM public.admin_users WHERE email = $1", [admin.email]);
      if (userRows.length > 0) {
        role = userRows[0].role as AdminRole;
        permissions = role === "super_admin" ? ALL_PERMISSIONS : (Array.isArray(userRows[0].permissions) ? userRows[0].permissions : ALL_PERMISSIONS);
      }
    } catch { /* use defaults */ }

    return { email: admin.email, firstName: admin.first_name || "", role, permissions };
  } catch { return null; }
}

export async function getSuperAdminCount(): Promise<number> {
  try {
    const rows = await db.query<{ count: number }>("SELECT COUNT(*) AS count FROM public.super_admins");
    return Number(rows[0]?.count ?? 0);
  } catch { return 0; }
}

export async function registerFirstAdmin(email: string, password: string, firstName: string): Promise<{ error?: string }> {
  const count = await getSuperAdminCount();
  if (count > 0) return { error: "Super admin already exists" };
  const hash = bcrypt.hashSync(password, 12);
  try {
    await db.query(
      "INSERT INTO public.super_admins (email, password_hash, first_name) VALUES ($1, $2, $3)",
      [email.toLowerCase(), hash, firstName]);
    const id = crypto.randomUUID();
    await db.create("admin_users", {
      id, email: email.toLowerCase(), first_name: firstName,
      password: "", role: "super_admin", permissions: ALL_PERMISSIONS,
    });
    await setSuperAdminSession(email, firstName);
    return {};
  } catch (e: any) {
    return { error: e?.message || "Failed to create admin" };
  }
}

export async function createInvite(
  email: string, createdById: string,
  opts: { firstName: string; role: AdminRole; permissions: Permission[]; tempPassword: string }
): Promise<{ token?: string; error?: string }> {
  const tempHash = bcrypt.hashSync(opts.tempPassword, 12);
  const payload = JSON.stringify({
    email: email.toLowerCase(), firstName: opts.firstName,
    role: opts.role, permissions: opts.permissions,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  const payloadB64 = Buffer.from(payload).toString("base64");
  const payloadUrl = payloadB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sig = await hmacSign(payloadB64, getSecret());
  const token = `${payloadUrl}~${sig}`;

  try {
    const existing = await db.query<{ id: string }>(
      "SELECT id FROM public.admin_invites WHERE email = $1 AND used_at IS NULL AND expires_at > now()",
      [email.toLowerCase()]);

    if (existing.length > 0) {
      await db.query(
        "UPDATE public.admin_invites SET token = $1, temp_password_hash = $2, first_name = $3, permissions = $4, role = $5, expires_at = now() + interval '7 days', created_at = now() WHERE id = $6",
        [token, tempHash, opts.firstName, JSON.stringify(opts.permissions), opts.role, existing[0].id]);
    } else {
      await db.query(
        "INSERT INTO public.admin_invites (email, token, created_by_id, expires_at, first_name, permissions, role, temp_password_hash) VALUES ($1, $2, $3, now() + interval '7 days', $4, $5, $6, $7)",
        [email.toLowerCase(), token, createdById, opts.firstName, JSON.stringify(opts.permissions), opts.role, tempHash]);
    }
    return { token };
  } catch (e: any) {
    return { error: e?.message || "Failed to create invite" };
  }
}

interface InvitePayload {
  email: string; firstName: string;
  role: AdminRole; permissions: Permission[];
  expiresAt: number;
}

export async function getInviteByToken(token: string): Promise<{ email: string; firstName: string; role: AdminRole; permissions: Permission[]; valid: boolean; error?: string }> {
  const sep = token.lastIndexOf("~");
  if (sep === -1) return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "Invalid token" };

  const payloadUrl = token.slice(0, sep);
  const sig = token.slice(sep + 1);
  let payloadB64 = payloadUrl.replace(/-/g, '+').replace(/_/g, '/');
  while (payloadB64.length % 4) payloadB64 += '=';

  const validSig = await hmacVerify(payloadB64, sig, getSecret());
  if (!validSig) return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "Invalid signature" };

  let payload: InvitePayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
  } catch {
    return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "Invalid payload" };
  }

  if (Date.now() > payload.expiresAt) return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "Invite expired" };

  try {
    const rows = await db.query<{ used_at: string | null }>(
      "SELECT used_at FROM public.admin_invites WHERE token = $1", [token]);
    if (rows.length === 0) return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "Invite not found" };
    if (rows[0].used_at) return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "Invite already used" };
    return { email: payload.email, firstName: payload.firstName, role: payload.role, permissions: payload.permissions, valid: true };
  } catch {
    return { email: "", firstName: "", role: "moderator", permissions: [], valid: false, error: "DB error" };
  }
}

export async function acceptInvite(token: string, tempPassword: string, newPassword: string, firstName: string = ""): Promise<{ error?: string }> {
  const invite = await getInviteByToken(token);
  if (!invite.valid) return { error: invite.error || "Invalid invite" };

  try {
    const inviteRows = await db.query<{ created_by_id: string; temp_password_hash: string }>(
      "SELECT created_by_id, temp_password_hash FROM public.admin_invites WHERE token = $1", [token]);
    if (inviteRows.length === 0) return { error: "Invite not found" };

    const validTemp = bcrypt.compareSync(tempPassword, inviteRows[0].temp_password_hash);
    if (!validTemp) return { error: "Invalid temporary password" };

    const name = firstName || invite.firstName;
    const hash = bcrypt.hashSync(newPassword, 12);

    await db.query(
      "INSERT INTO public.super_admins (email, password_hash, created_by_id, first_name) VALUES ($1, $2, $3, $4)",
      [invite.email, hash, inviteRows[0].created_by_id, name]);
    const id = crypto.randomUUID();
    await db.create("admin_users", {
      id, email: invite.email, first_name: name, password: "",
      role: invite.role, permissions: invite.permissions,
      invited_by: inviteRows[0].created_by_id,
    });
    await db.query("UPDATE public.admin_invites SET used_at = now() WHERE token = $1", [token]);

    await setSuperAdminSession(invite.email, name, invite.permissions, invite.role);
    return {};
  } catch (e: any) {
    return { error: e?.message || "Failed to accept invite" };
  }
}

export async function setSuperAdminSession(email: string, firstName: string = "", permissions: Permission[] = ALL_PERMISSIONS, role: AdminRole = "super_admin") {
  const cookie = await cookies();
  const payload = JSON.stringify({ email, firstName, role, permissions, createdAt: Date.now() });
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
    if (payload.role !== "super_admin" && payload.role !== "moderator") return null;
    return payload as SuperAdminSession;
  } catch { return null; }
}

export async function clearSuperAdminSession() {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, "", { path: "/admin", maxAge: 0 });
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const rows = await db.query<{ id: string }>(
    "SELECT id FROM public.super_admins WHERE LOWER(email) = LOWER($1)", [email]);
  if (rows.length === 0) return null;

  const token = crypto.randomUUID();
  const tokenHash = await sha256(token);
  await db.query(
    "INSERT INTO public.password_reset_tokens (email, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 hour')",
    [email.toLowerCase(), tokenHash]);
  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const tokenHash = await sha256(token);
  const rows = await db.query<{ email: string }>(
    "SELECT email FROM public.password_reset_tokens WHERE token_hash = $1 AND expires_at > now() AND used_at IS NULL",
    [tokenHash]);
  return rows.length > 0 ? rows[0].email : null;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ error?: string }> {
  const email = await verifyPasswordResetToken(token);
  if (!email) return { error: "Invalid or expired reset token" };

  const hash = bcrypt.hashSync(newPassword, 12);
  const tokenHash = await sha256(token);

  try {
    await db.query("UPDATE public.super_admins SET password_hash = $1 WHERE LOWER(email) = LOWER($2)", [hash, email]);
    await db.query("UPDATE public.password_reset_tokens SET used_at = now() WHERE token_hash = $1", [tokenHash]);
    return {};
  } catch (e: any) {
    return { error: e?.message || "Failed to reset password" };
  }
}
