import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bmac_admin_session";

const protectedRoutes = ["/admin"];
const publicRoutes = ["/admin/login"];

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
  const sig = raw.slice(dot + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"],
  );
  const expectedSigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const expectedSig = Array.from(new Uint8Array(expectedSigBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  if (expectedSig !== sig) return false;

  try {
    const payload = JSON.parse(base64Decode(payloadB64));
    return payload.role === "super_admin";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some(r => pathname === r || pathname.startsWith(r + "/"));
  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + "/"));

  if (isProtected && !isPublic) {
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
