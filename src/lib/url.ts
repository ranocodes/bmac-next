import { headers } from "next/headers";

export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host");
    if (host) {
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      return `${protocol}://${host}`;
    }
  } catch {}
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}
