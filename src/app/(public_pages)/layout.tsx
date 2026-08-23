import { Suspense } from "react";
import PublicLayout from "@/components/layouts/PublicLayout";
import CookieNotice from "@/components/CookieNotice";
import { getPublicSiteSettings } from "@/lib/site-settings";

interface ChromeProps {
  children: React.ReactNode;
  settings: Record<string, any> | null;
}

function SiteChrome({ children, settings }: ChromeProps) {
  const s = settings;
  return (
    <PublicLayout
      logoText={s?.logo_text || undefined}
      navLinks={s?.navigation || undefined}
      socialLinks={s?.social_links || undefined}
      copyright={s?.copyright || undefined}
      contactInfo={s?.contact_info || undefined}
    >
      {children}
      <CookieNotice />
    </PublicLayout>
  );
}

async function SiteChromeData({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSiteSettings();
  return <SiteChrome settings={settings}>{children}</SiteChrome>;
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SiteChrome settings={null}>{children}</SiteChrome>}>
      <SiteChromeData>{children}</SiteChromeData>
    </Suspense>
  );
}
