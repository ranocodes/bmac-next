import { db } from "@/lib/db";
import PublicLayout from "@/components/layouts/PublicLayout";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const settings = await db.query<any>("SELECT * FROM public.site_settings LIMIT 1");
  const s = settings?.[0] || null;

  return (
    <PublicLayout
      logoText={s?.logo_text || undefined}
      navLinks={s?.navigation || undefined}
      socialLinks={s?.social_links || undefined}
      copyright={s?.copyright || undefined}
      contactInfo={s?.contact_info || undefined}
    >
      {children}
    </PublicLayout>
  );
}
