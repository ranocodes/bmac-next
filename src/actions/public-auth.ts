"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { logActivity } from "./activity-logs";
import { isLoginLocked, recordLoginAttempt } from "@/lib/rate-limit";
import {
  createPublicSession,
  destroyPublicSession,
  verifyPassword,
  hashPassword,
  getPublicSession,
} from "@/lib/auth/public-auth";
import { sendPublicPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

interface PublicUserRow {
  id: string;
  email: string;
  password_hash: string;
  must_change_password: boolean;
  auth_status: string;
  created_at: string;
}

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}

export async function loginPublicUser(
  email: string,
  password: string
): Promise<{ error?: string; mustChangePassword?: boolean }> {
  try {
    if (!email || !password) return { error: "Email and password required" };
    const ip = await clientIp();
    if (await isLoginLocked(email, ip)) {
      return { error: "Too many failed attempts. Try again in 15 minutes." };
    }

    const rows = await db.query<PublicUserRow>(
      `SELECT id, email, password_hash, must_change_password, auth_status
       FROM public.public_users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      await recordLoginAttempt(email, ip, false);
      return { error: "Invalid email or password" };
    }

    const user = rows[0];

    if (user.auth_status !== "active") {
      await recordLoginAttempt(email, ip, false);
      return { error: "Account is suspended. Contact support." };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      await recordLoginAttempt(email, ip, false);
      return { error: "Invalid email or password" };
    }

    await recordLoginAttempt(email, ip, true);
    await createPublicSession(user.email, user.id);
    logActivity(user.email, "login", "auth", { details: "Public user login" });

    return { mustChangePassword: user.must_change_password };
  } catch (e) {
    console.error("loginPublicUser error:", e);
    return { error: "Login failed. Try again." };
  }
}

export async function logoutPublicUser(): Promise<void> {
  const session = await getPublicSession().catch(() => null);
  await destroyPublicSession();
  if (session) {
    logActivity(session.email, "logout", "auth", { details: "Public user logout" });
  }
  redirect("/login");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error?: string }> {
  try {
    const session = await getPublicSession();
    if (!session) return { error: "Not authenticated" };

    if (!currentPassword || !newPassword) {
      return { error: "Current and new password required" };
    }
    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters" };
    }

    const rows = await db.query<PublicUserRow>(
      `SELECT id, email, password_hash, must_change_password
       FROM public.public_users WHERE id = $1 LIMIT 1`,
      [session.userId]
    );
    if (!rows.length) return { error: "Account not found" };

    const user = rows[0];
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) return { error: "Current password is incorrect" };

    const newHash = await hashPassword(newPassword);
    await db.update("public_users", user.id, {
      password_hash: newHash,
      must_change_password: false,
    });

    logActivity(user.email, "password_change", "auth", { details: "Public user password changed" });
    return {};
  } catch (e) {
    console.error("changePassword error:", e);
    return { error: "Failed to change password" };
  }
}

interface PasswordResetRow {
  id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
}

async function ensurePasswordResetsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.public_password_resets (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `, []);
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPublicPasswordReset(
  email: string
): Promise<{ error?: string }> {
  try {
    if (!email) return { error: "Email is required" };

    await ensurePasswordResetsTable();

    const rows = await db.query<PublicUserRow>(
      `SELECT id, email FROM public.public_users WHERE LOWER(email) = LOWER($1) AND auth_status = 'active' LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return {};
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await db.query(
      `INSERT INTO public.public_password_resets (email, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [rows[0].email, tokenHash, expiresAt]
    );

    const appUrl = SITE_URL;
    const resetLink = `${appUrl}/reset-password/${token}`;

    await sendPublicPasswordResetEmail({
      email: rows[0].email,
      resetLink,
    });

    logActivity(rows[0].email, "password_reset_request", "auth", {
      details: "Public user password reset email sent",
    });

    return {};
  } catch (e) {
    console.error("requestPublicPasswordReset error:", e);
    return { error: "Failed to process request. Try again." };
  }
}

export async function executePublicPasswordReset(
  token: string,
  newPassword: string
): Promise<{ error?: string }> {
  try {
    if (!token || !newPassword) return { error: "Token and password required" };
    if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };

    await ensurePasswordResetsTable();

    const tokenHash = hashToken(token);

    const rows = await db.query<PasswordResetRow>(
      `SELECT id, email, token_hash, expires_at, used
       FROM public.public_password_resets
       WHERE token_hash = $1 AND used = false
       ORDER BY created_at DESC LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return { error: "Invalid or expired reset link" };
    }

    const reset = rows[0];
    if (new Date(reset.expires_at) < new Date()) {
      return { error: "Reset link has expired. Request a new one." };
    }

    const newHash = await hashPassword(newPassword);

    await db.query(
      `UPDATE public.public_users SET password_hash = $1, must_change_password = false WHERE LOWER(email) = LOWER($2)`,
      [newHash, reset.email]
    );

    await db.query(
      `UPDATE public.public_password_resets SET used = true WHERE id = $1`,
      [reset.id]
    );

    logActivity(reset.email, "password_reset", "auth", {
      details: "Public user password reset completed",
    });

    return {};
  } catch (e) {
    console.error("executePublicPasswordReset error:", e);
    return { error: "Failed to reset password. Try again." };
  }
}
