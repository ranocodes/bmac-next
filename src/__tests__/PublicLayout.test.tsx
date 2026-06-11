import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "./mocks";
import PublicLayout from "@/components/layouts/PublicLayout";

describe("PublicLayout", () => {
  it("renders children", () => {
    render(<PublicLayout><p>child content</p></PublicLayout>);
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("renders default logo text when none provided", () => {
    render(<PublicLayout><p>test</p></PublicLayout>);
    const logos = screen.getAllByText("BMAC");
    expect(logos.length).toBeGreaterThan(0);
  });

  it("renders custom logo text", () => {
    render(<PublicLayout logoText="TEST-LOGO"><p>test</p></PublicLayout>);
    const logos = screen.getAllByText("TEST-LOGO");
    expect(logos.length).toBeGreaterThan(0);
  });

  it("renders default copyright when none provided", () => {
    render(<PublicLayout><p>test</p></PublicLayout>);
    expect(screen.getByText(/Brilliant Minds/)).toBeInTheDocument();
  });

  it("renders custom copyright", () => {
    const year = new Date().getFullYear();
    render(<PublicLayout copyright="Custom (c) 2026"><p>test</p></PublicLayout>);
    expect(screen.getByText(`© ${year} Custom (c) 2026`)).toBeInTheDocument();
  });

  it("renders custom nav links in navbar and footer", () => {
    const navLinks = [{ name: "CustomLink", href: "/custom" }];
    render(<PublicLayout navLinks={navLinks}><p>test</p></PublicLayout>);
    const links = screen.getAllByText("CustomLink");
    expect(links).toHaveLength(2);
  });

  it("renders social links as aria-label", () => {
    const socialLinks = [{ name: "XSocial", href: "https://x.com/test", icon: "Twitter" }];
    render(<PublicLayout socialLinks={socialLinks}><p>test</p></PublicLayout>);
    expect(screen.getByRole("link", { name: "XSocial" })).toBeInTheDocument();
  });
});
