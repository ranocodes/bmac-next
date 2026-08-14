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
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card text-center md:text-left">
        <div
          className="absolute inset-0 bg-accent/5"
          style={{
            backgroundImage:
              "radial-gradient(var(--secondary) 0.5px, transparent 0.5px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
            Your Data, Your Trust
          </span>
          <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
            Privacy <span className="text-accent italic font-light serif">Policy</span>.
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-14">
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
