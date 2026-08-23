import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getPublicSiteSettings = unstable_cache(
  async (): Promise<Record<string, any> | null> => {
    const rows = await db
      .query<Record<string, any>>("SELECT * FROM public.site_settings LIMIT 1")
      .catch(() => [] as Record<string, any>[]);
    return rows?.[0] ?? null;
  },
  ["site-settings-v1"],
  { revalidate: 300, tags: ["site-settings"] }
);
