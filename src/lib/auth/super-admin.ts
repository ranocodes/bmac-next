import { cookies } from "next/headers";
import crypto from "crypto";
import type { AdminRole, Permission } from "@/types/cms";

const COOKIE_NAME = "bmac_admin_session";

export const ALL_PERMISSIONS: Permission[] = [
  "manage_news", "manage_events", "manage_programs", "manage_gallery",
  "manage_team", "manage_testimonials", "manage_categories", "manage_partners",
  "manage_stats", "manage_payments", "manage_people", "manage_logs",
  "manage_users", "access_settings", "export_data", "view_analytics",
  "manage_workflows", "check_in_attendees", "manage_newsletter",
];

export interface SuperAdminSession {
  email: string;
  firstName: string;
  role: AdminRole;
  permissions: Permission[];
  createdAt: number;
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

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export async function setSuperAdminSession(email: string, firstName: string = "", permissions: Permission[] = ALL_PERMISSIONS, role: AdminRole = "super_admin") {
  const cookie = await cookies();
  const payload = JSON.stringify({ email, firstName, role, permissions, createdAt: Date.now() });
  const payloadB64 = Buffer.from(payload).toString("base64");
  const sig = await hmacSign(payloadB64, getSecret());
  cookie.set(COOKIE_NAME, `${payloadB64}.${sig}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/admin", maxAge: SESSION_TTL_MS / 1000,
    priority: "high",
  });
}

export async function getSuperAdminSession(): Promise<SuperAdminSession | null> {
  try {
    const cookie = await cookies();
    const raw = cookie.get(COOKIE_NAME)?.value;
    if (!raw) return null;

    const dot = raw.lastIndexOf(".");
    if (dot === -1) return null;

    const payloadB64 = raw.slice(0, dot);
    const sig = raw.slice(dot + 1);

    const valid = await hmacVerify(payloadB64, sig, getSecret());
    if (!valid) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
    if (payload.role !== "super_admin" && payload.role !== "moderator" && payload.role !== "administrator") return null;
    const session = payload as SuperAdminSession;
    if (typeof session.createdAt === "number" && Date.now() - session.createdAt > SESSION_TTL_MS) {
      await clearSuperAdminSession();
      return null;
    }
    return session;
  } catch (e) {
    console.error("getSuperAdminSession error:", e);
    return null;
  }
}

export async function clearSuperAdminSession() {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/admin", maxAge: 0,
  });
}
