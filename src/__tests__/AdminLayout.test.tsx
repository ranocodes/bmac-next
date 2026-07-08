import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "./mocks";
import { mockUsePathname } from "./mocks";

vi.mock("@/lib/auth/admin-context", () => ({
  AdminProvider: ({ children }: any) => <>{children}</>,
  useAdmin: () => ({ email: "", firstName: "", role: "", permissions: [] }),
}));

vi.mock("@/components/ui/Toast", () => ({
  ToastProvider: ({ children }: any) => <>{children}</>,
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/actions/admin-auth", () => ({
  logoutAdmin: vi.fn(() => Promise.resolve()),
}));

import AdminLayout from "@/components/admin/AdminLayout";

describe("AdminLayout", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });
  it("renders children when user is provided", () => {
    render(
      <AdminLayout
        user={{ email: "admin@test.com", firstName: "Admin", role: "super_admin", permissions: [] }}
      >
        <p>dashboard content</p>
      </AdminLayout>
    );
    expect(screen.getByText("dashboard content")).toBeInTheDocument();
  });

  it("renders error state when error prop given", () => {
    render(
      <AdminLayout error="Authentication service unavailable. Please try signing in again.">
        <p>should not render</p>
      </AdminLayout>
    );
    expect(screen.getByText("Authentication Error")).toBeInTheDocument();
    expect(screen.getByText(/Authentication service unavailable/)).toBeInTheDocument();
    expect(screen.queryByText("should not render")).not.toBeInTheDocument();
  });

  it("renders login page without requiring user", () => {
    mockUsePathname.mockReturnValue("/admin/login");
    render(
      <AdminLayout>
        <p>login content</p>
      </AdminLayout>
    );
    expect(screen.getByText("login content")).toBeInTheDocument();
  });
});
