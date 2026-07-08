import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bmac_admin_session";

function base64Decode(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function verifyCookie(request: NextRequest): Promise<boolean> {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const secret = process.env.SUPER_ADMIN_COOKIE_SECRET;
  if (!secret) return false;

  const dot = raw.lastIndexOf(".");
  if (dot === -1) return false;

  const payloadB64 = raw.slice(0, dot);
  const sigHex = raw.slice(dot + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["verify"],
  );
  const sigBytes = Uint8Array.from(sigHex.match(/.{1,2}/g) || [], b => parseInt(b, 16));
  if (sigBytes.length === 0) return false;

  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payloadB64));
  if (!valid) return false;

  try {
    const payload = JSON.parse(base64Decode(payloadB64));
    return payload.role === "super_admin";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login" || pathname === "/admin/setup" || pathname.startsWith("/admin/invite/")) return NextResponse.next();

    const authed = await verifyCookie(request);
    if (!authed) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/admin/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
