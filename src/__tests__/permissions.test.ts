import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

vi.mock("@/lib/auth/super-admin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/super-admin")>();
  return { ...actual, getSuperAdminSession: vi.fn() };
});

import { requirePermission, requirePage } from "@/lib/auth/server";
import { getSuperAdminSession } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";
import { PERMISSION_LABELS, ROLE_DEFAULT_PERMISSIONS, ALL_PERMISSION_KEYS } from "@/lib/auth/permissions";

const mockedGetSession = vi.mocked(getSuperAdminSession);
const mockedRedirect = vi.mocked(redirect);

describe("requirePermission", () => {
  it("lets super_admin through with empty permissions", async () => {
    mockedGetSession.mockResolvedValue({
      email: "boss@x.com", firstName: "Boss", role: "super_admin", permissions: [], createdAt: Date.now(),
    });
    const admin = await requirePermission("manage_events");
    expect(admin.email).toBe("boss@x.com");
  });

  it("lets non-super through when permission present", async () => {
    mockedGetSession.mockResolvedValue({
      email: "e@x.com", firstName: "E", role: "moderator", permissions: ["manage_events"], createdAt: Date.now(),
    });
    await expect(requirePermission("manage_events")).resolves.toMatchObject({ email: "e@x.com" });
  });

  it("throws for non-super without the permission", async () => {
    mockedGetSession.mockResolvedValue({
      email: "e@x.com", firstName: "E", role: "moderator", permissions: ["manage_events"], createdAt: Date.now(),
    });
    await expect(requirePermission("manage_payments")).rejects.toThrow("Forbidden");
  });
});

describe("requirePage", () => {
  it("redirects to /admin/login when unauthenticated", async () => {
    mockedGetSession.mockResolvedValue(null);
    await expect(requirePage("manage_events")).rejects.toThrow("redirect");
    expect(mockedRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects to /admin when denied for an authenticated user", async () => {
    mockedGetSession.mockResolvedValue({
      email: "e@x.com", firstName: "E", role: "moderator", permissions: ["manage_events"], createdAt: Date.now(),
    });
    await expect(requirePage("manage_payments")).rejects.toThrow("redirect");
    expect(mockedRedirect).toHaveBeenCalledWith("/admin");
  });
});

describe("permissions module", () => {
  it("labels every permission key", () => {
    expect(PERMISSION_LABELS.map(p => p.key)).toEqual(ALL_PERMISSION_KEYS);
    PERMISSION_LABELS.forEach(p => expect(p.label.length).toBeGreaterThan(0));
  });

  it("super_admin defaults to all permissions", () => {
    expect(ROLE_DEFAULT_PERMISSIONS.super_admin).toEqual(ALL_PERMISSION_KEYS);
  });

  it("moderator defaults exclude admin/export/system perms", () => {
    const mod = ROLE_DEFAULT_PERMISSIONS.moderator;
    expect(mod).not.toContain("manage_users");
    expect(mod).not.toContain("manage_payments");
    expect(mod).not.toContain("access_settings");
    expect(mod).not.toContain("export_data");
    expect(mod).toContain("view_analytics");
  });

  it("export_data is a distinct permission", () => {
    expect(ALL_PERMISSION_KEYS).toContain("export_data");
  });
});
