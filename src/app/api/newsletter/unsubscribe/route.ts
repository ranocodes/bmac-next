import { NextResponse } from 'next/server';
import { unsubscribeNewsletter } from '@/actions/newsletter-admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";
  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }
  const redirectUrl = new URL("/unsubscribe", url.origin);
  redirectUrl.searchParams.set("email", email);
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";
  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }
  const result = await unsubscribeNewsletter(email);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
