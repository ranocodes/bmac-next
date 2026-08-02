import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRegister = vi.fn();
const mockSetSession = vi.fn();
const mockLog = vi.fn();

vi.mock("@/lib/auth/client", () => ({
  registerFirstAdmin: (...args: unknown[]) => mockRegister(...args),
}));
vi.mock("@/lib/auth/super-admin", () => ({
  setSuperAdminSession: (...args: unknown[]) => mockSetSession(...args),
  getSuperAdminSession: vi.fn(),
  clearSuperAdminSession: vi.fn(),
}));
vi.mock("@/actions/activity-logs", () => ({
  logActivity: (...args: unknown[]) => mockLog(...args),
}));

import { registerFirstAdminAction } from "@/actions/admin-auth";

describe("registerFirstAdminAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers first admin and starts a super admin session", async () => {
    mockRegister.mockResolvedValue({
      email: "a@b.com",
      firstName: "Alice",
      role: "super_admin",
      permissions: ["manage_users"],
      error: undefined,
    });

    const result = await registerFirstAdminAction("a@b.com", "password123", "Alice");

    expect(result).toEqual({});
    expect(mockSetSession).toHaveBeenCalledWith("a@b.com", "Alice", ["manage_users"], "super_admin");
    expect(mockLog).toHaveBeenCalledWith("a@b.com", "register", "auth", {
      details: "First admin registered: Alice",
    });
  });

  it("passes through an error and does not start a session", async () => {
    mockRegister.mockResolvedValue({ error: "First admin already exists" });

    const result = await registerFirstAdminAction("a@b.com", "password123", "Alice");

    expect(result).toEqual({ error: "First admin already exists" });
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockLog).not.toHaveBeenCalled();
  });
});
