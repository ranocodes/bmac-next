import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "./mocks";
import { mockUseRouter } from "./mocks";

const mockLogin = vi.fn();
vi.mock("@/actions/admin-auth", () => ({
  loginAdmin: (...args: unknown[]) => mockLogin(...args),
}));

import LoginForm from "@/components/admin/LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() });
  });

  it("shows Create Super Administrator link when no admins exist", () => {
    render(<LoginForm hasAdmins={false} />);
    const link = screen.getByRole("link", { name: /Create Super Administrator/i });
    expect(link.getAttribute("href")).toBe("/admin/setup");
  });

  it("hides Create Super Administrator link when admins exist", () => {
    render(<LoginForm hasAdmins={true} />);
    expect(screen.queryByRole("link", { name: /Create Super Administrator/i })).not.toBeInTheDocument();
  });

  it("submits credentials and shows error result", async () => {
    mockLogin.mockResolvedValue({ error: "Invalid email or password" });
    render(<LoginForm hasAdmins={true} />);

    fireEvent.change(screen.getByPlaceholderText("admin@example.org"), {
      target: { value: "admin@example.org" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(await screen.findByText(/Invalid email or password/)).toBeInTheDocument();
    expect(mockLogin).toHaveBeenCalledWith("admin@example.org", "secret");
  });

  it("redirects to /admin on successful login", async () => {
    const push = vi.fn();
    mockUseRouter.mockReturnValue({ push, replace: vi.fn(), prefetch: vi.fn() });
    mockLogin.mockResolvedValue({});
    render(<LoginForm hasAdmins={true} />);

    fireEvent.change(screen.getByPlaceholderText("admin@example.org"), {
      target: { value: "admin@example.org" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin"));
  });
});
