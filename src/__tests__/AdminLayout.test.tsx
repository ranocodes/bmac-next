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

  it("denied route renders Access Denied and not children", () => {
    mockUsePathname.mockReturnValue("/admin/settings");
    render(
      <AdminLayout
        user={{ email: "denied@test.com", firstName: "Denied", role: "super_admin", permissions: [] }}
      >
        <p>dashboard content</p>
      </AdminLayout>
    );
    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.getByText(/required permissions/)).toBeInTheDocument();
    expect(screen.queryByText("dashboard content")).not.toBeInTheDocument();
  });

  it("permitted route renders children", () => {
    mockUsePathname.mockReturnValue("/admin/settings");
    render(
      <AdminLayout
        user={{ email: "admin@test.com", firstName: "Admin", role: "super_admin", permissions: ["access_settings"] }}
      >
        <p>settings content</p>
      </AdminLayout>
    );
    expect(screen.getByText("settings content")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Access Denied" })).not.toBeInTheDocument();
  });

  it("events route requires manage_events", () => {
    mockUsePathname.mockReturnValue("/admin/events");
    render(
      <AdminLayout
        user={{ email: "editor@test.com", firstName: "Editor", role: "moderator", permissions: ["manage_events"] }}
      >
        <p>events content</p>
      </AdminLayout>
    );
    expect(screen.getByText("events content")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Access Denied" })).not.toBeInTheDocument();
  });

  it("payments route without manage_payments renders Access Denied", () => {
    mockUsePathname.mockReturnValue("/admin/donations");
    render(
      <AdminLayout
        user={{ email: "editor@test.com", firstName: "Editor", role: "moderator", permissions: ["manage_events"] }}
      >
        <p>payments content</p>
      </AdminLayout>
    );
    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByText("payments content")).not.toBeInTheDocument();
  });
});
