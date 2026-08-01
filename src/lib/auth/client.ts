import type { AdminRole, Permission } from "@/types/cms";

const SERVICE_URL = (process.env.EMAIL_SERVICE_URL || "http://localhost:3001").replace(/\/+$/, "");
const API_KEY = process.env.EMAIL_SERVICE_API_KEY || "";

interface AuthResponse {
  email?: string;
  firstName?: string;
  role?: AdminRole;
  permissions?: Permission[];
  error?: string;
}

interface AdminsCountResponse {
  count: number;
  error?: string;
}

interface CreateAdminResponse {
  email?: string;
  firstName?: string;
  role?: AdminRole;
  permissions?: Permission[];
  error?: string;
}

interface SendCredentialsResponse {
  success?: boolean;
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

export async function createAdmin(
  createdByEmail: string,
  opts: { email: string; firstName: string; role: AdminRole; permissions: Permission[]; password: string }
): Promise<CreateAdminResponse> {
  return post<CreateAdminResponse>("/api/auth/create-admin", {
    email: opts.email,
    firstName: opts.firstName,
    role: opts.role,
    permissions: opts.permissions,
    password: opts.password,
    createdByEmail,
    baseUrl:
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });
}

export async function sendCredentials(opts: { email: string; firstName: string; password: string; role: AdminRole }): Promise<SendCredentialsResponse> {
  return post<SendCredentialsResponse>("/send", {
    type: "credentials",
    email: opts.email,
    firstName: opts.firstName,
    password: opts.password,
    role: opts.role,
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
