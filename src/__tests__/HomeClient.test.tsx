import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "./mocks";

vi.mock("@/components/FadeIn", () => ({
  default: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/ui/circular-testimonials", () => ({
  CircularTestimonials: ({ testimonials }: any) => (
    <div data-testid="circular-testimonials">
      {testimonials?.map((t: any) => <span key={t.id}>{t.name}</span>)}
    </div>
  ),
}));

vi.mock("@/components/ui/DigitalPass", () => ({
  DigitalPass: () => <div data-testid="digital-pass" />,
}));

vi.mock("@/components/ui/PartnersSection", () => ({
  default: ({ initialPartners }: any) => (
    <div data-testid="partners-section">
      {initialPartners?.map((p: any) => <span key={p.id}>{p.name}</span>)}
    </div>
  ),
}));

vi.mock("@/components/ui/NewsletterModal", () => ({
  default: () => <div data-testid="newsletter-modal" />,
}));

vi.mock("@/lib/iconMapper", () => ({
  getIcon: () => <svg data-testid="mock-icon" />,
}));

import HomeClient from "@/app/HomeClient";

const mockPrograms = [
  {
    id: "prog-1",
    title: "Public Speaking",
    description: "Master communication",
    long_desc: "desc",
    img: "/speaking.jpg",
    img_url: "/speaking.jpg",
    icon: "MicVocal",
    icon_name: "MicVocal",
    color: "text-emerald-400",
    color_class: "text-emerald-400",
    details: "12 weeks",
    variant: "default",
    status: "published",
    landingPage: true,
    landing_page: true,
    skills: ["Skill 1"],
    faqs: [{ q: "Q?", a: "A" }],
  },
  {
    id: "prog-2",
    title: "Literary Arts",
    description: "Explore writing",
    long_desc: "desc",
    img: "/literary.jpg",
    icon: "BookOpen",
    color: "text-blue-400",
    details: "10 weeks",
    variant: "default",
    status: "published",
    landingPage: false,
    skills: [],
    faqs: [],
  },
];

const mockTestimonials = [
  { id: "t1", name: "Maryam", quote: "Great!", designation: "Student", src: "/img.jpg", status: "published" },
];

const mockStats = [
  { id: "s1", num: "500+", label: "Students", icon: "Users", status: "published" },
];

const mockPartners = [
  { id: "p1", name: "UNICEF", logo: "/logo.svg", status: "active", order: 1 },
];

describe("HomeClient", () => {
  it("renders hero section heading", () => {
    render(
      <HomeClient
        initialPrograms={[]}
        initialTestimonials={[]}
        initialStats={[]}
        initialPartners={[]}
      />
    );
    expect(screen.getByText(/Confident/)).toBeInTheDocument();
  });

  it("renders digital-pass components when programs provided", () => {
    render(
      <HomeClient
        initialPrograms={mockPrograms}
        initialTestimonials={[]}
        initialStats={[]}
        initialPartners={[]}
      />
    );
    const passes = screen.getAllByTestId("digital-pass");
    expect(passes.length).toBeGreaterThan(0);
  });

  it("renders testimonials when provided", () => {
    render(
      <HomeClient
        initialPrograms={[]}
        initialTestimonials={mockTestimonials}
        initialStats={[]}
        initialPartners={[]}
      />
    );
    expect(screen.getByText("Maryam")).toBeInTheDocument();
  });

  it("renders stats when provided", () => {
    render(
      <HomeClient
        initialPrograms={[]}
        initialTestimonials={[]}
        initialStats={mockStats}
        initialPartners={[]}
      />
    );
    expect(screen.getByText("500+")).toBeInTheDocument();
  });

  it("renders partners section when provided", () => {
    render(
      <HomeClient
        initialPrograms={[]}
        initialTestimonials={[]}
        initialStats={[]}
        initialPartners={mockPartners}
      />
    );
    expect(screen.getByText("UNICEF")).toBeInTheDocument();
  });

  it("handles empty programs gracefully", () => {
    render(
      <HomeClient
        initialPrograms={[]}
        initialTestimonials={[]}
        initialStats={[]}
        initialPartners={[]}
      />
    );
    expect(screen.queryByTestId("digital-pass")).not.toBeInTheDocument();
  });
});
