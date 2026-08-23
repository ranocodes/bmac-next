import { getPublicSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/site";

export default async function SchemaOrg() {
  const settings = await getPublicSiteSettings();
  const contact = (settings?.contact_info as { email?: string; phone?: string } | undefined) || {};

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "Brilliant Minds Ambassadors Club",
          url: SITE_URL,
          description:
            "Empowering young minds in Jos through public speaking, literary arts, mentorship, and digital literacy programs.",
          email: contact.email || undefined,
          telephone: contact.phone || undefined,
          address: { "@type": "PostalAddress", addressLocality: "Jos", addressCountry: "NG" },
        }),
      }}
    />
  );
}
