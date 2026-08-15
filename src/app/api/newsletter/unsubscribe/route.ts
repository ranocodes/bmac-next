import { NextResponse } from 'next/server';
import { unsubscribeNewsletter } from '@/actions/newsletter-admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";
  const result = await unsubscribeNewsletter(email);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
