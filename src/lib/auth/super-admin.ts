import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "bmac_admin_session";

export interface SuperAdminSession {
  email: string;
  role: "super_admin";
  createdAt: number;
}

function getSecret(): string {
  const secret = process.env.SUPER_ADMIN_COOKIE_SECRET;
  if (!secret) throw new Error("SUPER_ADMIN_COOKIE_SECRET not set");
  return secret;
}

export function verifyPassword(password: string): boolean {
  const hash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compareSync(password, hash);
}

export function verifySuperAdminEmail(email: string): boolean {
  const expected = process.env.SUPER_ADMIN_EMAIL;
  if (!expected) return false;
  return email.toLowerCase() === expected.toLowerCase();
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function setSuperAdminSession(email: string) {
  const cookie = await cookies();
  const payload = JSON.stringify({ email, role: "super_admin", createdAt: Date.now() });
  const sig = await hmacSign(payload, getSecret());
  cookie.set(COOKIE_NAME, `${Buffer.from(payload).toString("base64")}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24, // 24 hours
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
  } catch {
    return null;
  }
}

export async function clearSuperAdminSession() {
  const cookie = await cookies();
  cookie.delete(COOKIE_NAME);
}
