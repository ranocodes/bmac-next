import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "./mocks";
import { mockRedirect } from "./mocks";

const mockCount = vi.fn();
vi.mock("@/lib/auth/client", () => ({
  getAdminsCount: () => mockCount(),
}));
vi.mock("@/components/admin/SetupForm", () => ({
  default: () => <div data-testid="setup-form" />,
}));

import SetupPage from "@/app/admin/(public)/setup/page";

describe("SetupPage", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  it("redirects to login when admins already exist", async () => {
    mockCount.mockResolvedValue(1);

    await SetupPage();

    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("renders the setup form when no admins exist", async () => {
    mockCount.mockResolvedValue(0);

    render(await SetupPage());

    expect(screen.getByTestId("setup-form")).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
