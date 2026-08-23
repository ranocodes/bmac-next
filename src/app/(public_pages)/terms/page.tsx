import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing the use of the BMAC Jos website, programs, events and services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const sections = [
    {
      h: "Acceptance of Terms",
      p: "By accessing or using the BMAC Jos website (bmacjos.org) and any related services, you agree to these Terms of Service. If you do not agree, please do not use the site. These terms apply to all visitors, applicants, members, volunteers and partners.",
    },
    {
      h: "About BMAC",
      p: "Brilliant Minds Academic & Career Foundation (BMAC) is a youth empowerment organization based in Jos, Plateau State, Nigeria. We run programs in public speaking, literary arts, mentorship and digital literacy, alongside community events and donation-funded initiatives.",
    },
    {
      h: "Accounts & Eligibility",
      p: "Some features — such as member portals, event registration and program applications — require an account. You agree to provide accurate information, keep your credentials confidential, and notify us immediately at hello@bmacjos.org if you suspect unauthorized access. Accounts are personal and may not be shared.",
    },
    {
      h: "Programs & Events",
      p: "Registration for programs and events may be subject to eligibility criteria, capacity limits and, where applicable, participation fees. Fees paid for paid programs are governed by the refund policy stated on the relevant program page. BMAC may reschedule or cancel events; where this happens, registered participants will be notified and fees refunded where applicable.",
    },
    {
      h: "Donations",
      p: "Donations made through the site are voluntary contributions to support BMAC's mission. Donations are generally non-refundable; however, if you believe a donation was made in error, contact hello@bmacjos.org and we will review your request in good faith. Payment processing is handled by third-party providers (such as Paystack), and their terms also apply.",
    },
    {
      h: "Acceptable Use",
      p: "You agree not to misuse the site. This includes attempting to gain unauthorized access, interfering with site operation, submitting false information, uploading malicious content, or using the site for any unlawful purpose. We may suspend or terminate access for violations.",
    },
    {
      h: "Content & Intellectual Property",
      p: "All content on this site — including text, images, logos and program materials — belongs to BMAC or its licensors. You may not reproduce or distribute it without permission, except for personal, non-commercial use. Content you submit (such as applications, testimonials or gallery media) grants BMAC permission to use it in connection with our mission.",
    },
    {
      h: "Privacy",
      p: "Our collection and use of personal information is described in our Privacy Policy, which forms part of these terms.",
    },
    {
      h: "Disclaimer & Liability",
      p: "The site is provided on an \"as is\" basis. While we work hard to keep information accurate and the site available, BMAC makes no warranties about completeness or uptime. To the fullest extent permitted by law, BMAC is not liable for indirect or consequential damages arising from your use of the site.",
    },
    {
      h: "Changes & Governing Law",
      p: "We may update these terms from time to time; continued use of the site after changes means acceptance. These terms are governed by the laws of the Federal Republic of Nigeria. Questions? Contact hello@bmacjos.org.",
    },
  ];

  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="bg-background pt-32 pb-12 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
            The Fine Print
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary">
            Terms of Service
          </h1>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-12">
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Last updated: August 2026
          </p>
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display text-xl md:text-2xl font-bold text-secondary tracking-tight mb-3">
                {s.h}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {s.p}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
