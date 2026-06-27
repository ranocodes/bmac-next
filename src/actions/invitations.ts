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
  invited_by: string;
}) {
  const result = await db.create("invitations", {
    id: data.id,
    email: data.email,
    role: data.role,
    code: data.code,
    created_by: data.invited_by,
  });
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

export async function validateInviteCode(code: string): Promise<{ error?: string; invite?: any }> {
  const invite = await getInviteByCode(code);
  if (!invite) return { error: "Invalid or expired invitation code." };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: "This invitation has expired. Please ask an admin to send a new one." };
  }
  return { invite };
}

export async function acceptInviteAction(params: {
  code: string;
  email: string;
  firstName: string;
  password: string;
  role: string;
  permissions: string[];
}): Promise<{ error?: string; success?: boolean; adminId?: string }> {
  const { code, email, firstName, password, role, permissions } = params;

  const validation = await validateInviteCode(code);
  if (validation.error) return { error: validation.error };

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

  await db.query("UPDATE public.invitations SET used = true, used_at = $1 WHERE code = $2", [new Date().toISOString(), code]);

  return { success: true, adminId };
}

export async function acceptExistingUserInvite(params: {
  code: string;
  email: string;
  firstName: string;
  role: string;
  permissions: string[];
}): Promise<{ error?: string; success?: boolean; adminId?: string }> {
  const { code, email, firstName, role, permissions } = params;

  const validation = await validateInviteCode(code);
  if (validation.error) return { error: validation.error };

  const existing = await db.query<any>(
    "SELECT id FROM public.admin_users WHERE email = $1",
    [email]
  );
  if (existing.length > 0) return { error: "Account already exists for this email" };

  const adminId = `admin-${Date.now()}`;
  await db.create("admin_users", {
    id: adminId,
    email,
    password: "",
    first_name: firstName,
    role,
    permissions,
  });

  await db.query("UPDATE public.invitations SET used = true, used_at = $1 WHERE code = $2", [new Date().toISOString(), code]);

  return { success: true, adminId };
}
