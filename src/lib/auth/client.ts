import type { AdminRole, Permission } from "@/types/cms";

const SERVICE_URL = (process.env.EMAIL_SERVICE_URL || "http://localhost:3001").replace(/\/+$/, "");
const API_KEY = process.env.EMAIL_SERVICE_API_KEY || "";

interface AuthResponse {
  email?: string;
  firstName?: string;
  role?: AdminRole;
  permissions?: Permission[];
  error?: string;
  valid?: boolean;
}

interface AdminsCountResponse {
  count: number;
  error?: string;
}

interface InviteResponse {
  email?: string;
  firstName?: string;
  role?: AdminRole;
  permissions?: Permission[];
  valid: boolean;
  error?: string;
}

interface CreateInviteResponse {
  token?: string;
  error?: string;
}

async function post<T = Record<string, unknown>>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SERVICE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(body || {}),
  });
  return res.json() as Promise<T>;
}

async function get<T = Record<string, unknown>>(path: string): Promise<T> {
  const res = await fetch(`${SERVICE_URL}${path}`, {
    method: "GET",
    headers: { "x-api-key": API_KEY },
  });
  return res.json() as Promise<T>;
}

export async function getAdminsCount(): Promise<number> {
  const data = await get<AdminsCountResponse>("/api/auth/admins-count");
  return data.count ?? 0;
}

export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/login", { email, password });
}

export async function registerFirstAdmin(email: string, password: string, firstName: string): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/register-first-admin", { email, password, firstName });
}

export async function getInviteByToken(token: string): Promise<InviteResponse> {
  return get<InviteResponse>(`/api/auth/invite/${encodeURIComponent(token)}`);
}

export async function acceptInvite(token: string, tempPassword: string, newPassword: string, firstName?: string): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/accept-invite", { token, tempPassword, newPassword, firstName });
}

export async function createInvite(
  createdByEmail: string,
  opts: { email: string; firstName: string; role: AdminRole; permissions: Permission[]; tempPassword: string }
): Promise<CreateInviteResponse> {
  return post<CreateInviteResponse>("/api/auth/create-invite", {
    email: opts.email,
    createdByEmail,
    firstName: opts.firstName,
    role: opts.role,
    permissions: opts.permissions,
    tempPassword: opts.tempPassword,
    baseUrl:
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });
}

export async function requestPasswordReset(email: string): Promise<{ success?: boolean; error?: string }> {
  return post<{ success?: boolean; error?: string }>("/api/auth/forgot-password", {
    email,
    baseUrl:
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success?: boolean; error?: string }> {
  return post<{ success?: boolean; error?: string }>("/api/auth/reset-password", { token, newPassword });
}
