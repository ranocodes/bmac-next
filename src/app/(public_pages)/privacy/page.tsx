import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BMAC collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const sections = [
    {
      h: "Who We Are",
      p: "Bright Minds Academic & Career Foundation (BMAC) is a youth empowerment organization based in Jos, Plateau State, Nigeria. This policy explains what information we collect when you reach out to us and how we use it.",
    },
    {
      h: "Information We Collect",
      p: "When you use our contact, membership, volunteer, partnership, or event registration forms we collect the details you choose to provide: your name, email address, phone number, and the content of your message or application. We also record the consent choices you make on those forms.",
    },
    {
      h: "How We Use Your Information",
      p: "We use your information to respond to your enquiries, process membership, volunteer, and partnership applications, send you the application forms and event details you requested, and — only if you opt in — send you news, updates, and opportunities from BMAC. We do not sell, rent, or share your personal information with third parties for their own marketing.",
    },
    {
      h: "Consent & Choice",
      p: "Agreeing to the privacy policy is required to submit a form so we can lawfully process your request. Opting in to marketing communications is entirely optional and can be withdrawn at any time by replying to any of our emails or contacting hello@bmacjos.org.",
    },
    {
      h: "Data Retention & Security",
      p: "We keep your details for as long as needed to serve your relationship with BMAC and to meet legal and reporting obligations. Access to your information is restricted to authorized BMAC staff and administrators, and reasonable technical measures are used to protect it.",
    },
    {
      h: "Your Rights",
      p: "You may request access to, correction of, or deletion of the personal information we hold about you. To exercise these rights, email hello@bmacjos.org. We will respond within a reasonable time.",
    },
    {
      h: "Contact",
      p: "Questions about this policy or your data? Reach us at hello@bmacjos.org, or visit our hub on Nalado Street, Jos, Plateau State.",
    },
  ];

  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="bg-background pt-32 pb-12 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
            Your Data, Your Trust
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary">
            Privacy Policy
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
