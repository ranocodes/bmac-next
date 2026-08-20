import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "bmac-public-session";

export interface PublicSession {
  email: string;
  userId: string;
  createdAt: number;
}

function getSecret(): string {
  const secret = process.env.PUBLIC_AUTH_COOKIE_SECRET;
  if (!secret) throw new Error("PUBLIC_AUTH_COOKIE_SECRET not set");
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createPublicSession(email: string, userId: string): Promise<string> {
  const cookie = await cookies();
  const payload = JSON.stringify({ email, userId, createdAt: Date.now() });
  const payloadB64 = Buffer.from(payload).toString("base64");
  const sig = await hmacSign(payloadB64, getSecret());
  const token = `${payloadB64}.${sig}`;
  cookie.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
    priority: "high",
  });
  return token;
}

export async function getPublicSession(): Promise<PublicSession | null> {
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
    const session = payload as PublicSession;
    if (typeof session.createdAt === "number" && Date.now() - session.createdAt > SESSION_TTL_MS) {
      await destroyPublicSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function destroyPublicSession(): Promise<void> {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const arr = crypto.randomBytes(12);
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars[arr[i] % chars.length];
  }
  return result;
}
