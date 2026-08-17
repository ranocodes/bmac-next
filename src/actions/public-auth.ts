"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
