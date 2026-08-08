import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequirePermission = vi.fn();
const mockUpdateAdmin = vi.fn();
const mockLog = vi.fn();
const mockQuery = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}));
vi.mock("@/lib/auth/client", () => ({
  updateAdmin: (...args: unknown[]) => mockUpdateAdmin(...args),
}));
vi.mock("@/actions/activity-logs", () => ({
  logActivity: (...args: unknown[]) => mockLog(...args),
}));
vi.mock("@/lib/db", () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import { updateAdminUser } from "@/actions/admin-users";

const superCaller = { email: "boss@x.com", firstName: "Boss", role: "super_admin", permissions: ["manage_users"] };
const moderatorCaller = { email: "mod@x.com", firstName: "Mod", role: "moderator", permissions: ["manage_users"] };

describe("updateAdminUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects self email change", async () => {
    mockRequirePermission.mockResolvedValue(superCaller);

    const result = await updateAdminUser("id-1", { email: "boss@x.com" });

    expect(result).toEqual({ error: "Cannot change your own email" });
    expect(mockUpdateAdmin).not.toHaveBeenCalled();
  });

  it("rejects role change from a non-super admin caller", async () => {
    mockRequirePermission.mockResolvedValue(moderatorCaller);

    const result = await updateAdminUser("id-1", { role: "super_admin" });

    expect(result).toEqual({ error: "Only a super admin can change roles" });
    expect(mockUpdateAdmin).not.toHaveBeenCalled();
  });

  it("rejects demoting the last super admin", async () => {
    mockRequirePermission.mockResolvedValue(superCaller);
    mockQuery.mockResolvedValue([{ count: "1" }]);

    const result = await updateAdminUser("id-1", { role: "moderator" });

    expect(result).toEqual({ error: "Cannot demote the last super admin" });
    expect(mockUpdateAdmin).not.toHaveBeenCalled();
  });

  it("allows a super admin to change role when another super admin exists", async () => {
    mockRequirePermission.mockResolvedValue(superCaller);
    mockQuery.mockResolvedValue([{ count: "2" }]);
    mockUpdateAdmin.mockResolvedValue({ success: true, email: "target@x.com", firstName: "Target", role: "moderator", error: undefined });

    const result = await updateAdminUser("id-1", { role: "moderator" });

    expect(result).toEqual({});
    expect(mockUpdateAdmin).toHaveBeenCalledWith("id-1", { role: "moderator" });
    expect(mockLog).toHaveBeenCalledWith("boss@x.com", "admin_role_update", "auth", {
      details: "Role/permissions updated for target@x.com",
    });
  });

  it("forwards permissions changes and logs admin_role_update", async () => {
    mockRequirePermission.mockResolvedValue(superCaller);
    mockUpdateAdmin.mockResolvedValue({ success: true, email: "target@x.com", firstName: "Target", error: undefined });

    const result = await updateAdminUser("id-1", { permissions: ["manage_news"] });

    expect(result).toEqual({});
    expect(mockUpdateAdmin).toHaveBeenCalledWith("id-1", { permissions: ["manage_news"] });
    expect(mockLog).toHaveBeenCalledWith("boss@x.com", "admin_role_update", "auth", {
      details: "Role/permissions updated for target@x.com",
    });
  });

  it("logs plain admin_update for name/email-only edits", async () => {
    mockRequirePermission.mockResolvedValue(moderatorCaller);
    mockUpdateAdmin.mockResolvedValue({ success: true, email: "target@x.com", firstName: "New", error: undefined });

    const result = await updateAdminUser("id-1", { firstName: "New" });

    expect(result).toEqual({});
    expect(mockUpdateAdmin).toHaveBeenCalledWith("id-1", { firstName: "New" });
    expect(mockLog).toHaveBeenCalledWith("mod@x.com", "admin_update", "auth", {
      details: "Updated target@x.com",
    });
  });

  it("passes through a backend error", async () => {
    mockRequirePermission.mockResolvedValue(superCaller);
    mockUpdateAdmin.mockResolvedValue({ error: "Admin not found" });

    const result = await updateAdminUser("missing", { firstName: "X" });

    expect(result).toEqual({ error: "Admin not found" });
    expect(mockLog).not.toHaveBeenCalled();
  });
});
