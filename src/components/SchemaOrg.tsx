import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export default async function SchemaOrg() {
  const rows = await db.query<{ contact_info?: { email?: string; phone?: string } }>(
    "SELECT contact_info FROM public.site_settings LIMIT 1"
  );
  const contact = rows?.[0]?.contact_info || {};

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
