const FALLBACK = "https://bmac-next.vercel.app";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || FALLBACK
).replace(/\/+$/, "");

export const SITE_NAME = "BMAC Jos — Brilliant Minds Ambassadors Club";

export const SITE_TAGLINE =
  "Brilliant Minds Academic & Career Foundation — empowering young minds in Jos, Nigeria through education, mentorship and community.";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
