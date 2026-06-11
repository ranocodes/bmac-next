"use server";

import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function getInvitations() {
  return db.getAll<any>("invitations").catch(() => []);
}

export async function createInvite(data: {
  id: string;
  email: string;
  role: string;
  code: string;
  permissions: string[];
  invited_by: string;
  message?: string;
}) {
  const result = await db.create("invitations", data);
  // Add email to Clerk allowlist so they can sign up
  try {
    const client = await clerkClient();
    await client.allowlistIdentifiers.createAllowlistIdentifier({ identifier: data.email, notify: false });
  } catch (e) {
    console.warn("Failed to add email to Clerk allowlist:", e);
  }
  return result;
}

export async function revokeInvite(id: string) {
  return db.remove("invitations", id);
}

export async function getInviteByCode(code: string) {
  const rows = await db.query<any>(
    "SELECT * FROM public.invitations WHERE code = $1 AND (used = false OR used IS NULL)",
    [code]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function acceptInviteAction(params: {
  code: string;
  email: string;
  firstName: string;
  password: string;
  role: string;
  permissions: string[];
}) {
  const { code, email, firstName, password, role, permissions } = params;

  const existing = await db.query<any>(
    "SELECT id FROM public.admin_users WHERE email = $1",
    [email]
  );
  if (existing.length > 0) return { error: "Account already exists for this email" };

  const adminId = `admin-${Date.now()}`;
  await db.create("admin_users", {
    id: adminId,
    email,
    password,
    first_name: firstName,
    role,
    permissions,
  });

  await db.update("invitations", code, { used: true, used_at: new Date().toISOString() });

  return { success: true, adminId };
}
