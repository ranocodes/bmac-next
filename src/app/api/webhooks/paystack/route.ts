import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmChargeSuccess } from '@/lib/paystack-confirm';

const PLACEHOLDER_MARKERS = [
  "your_",
  "xxxx",
  "replace",
  "sk_live_0000",
  "sk_test_0000",
  "pk_live_0000",
  "pk_test_0000",
  "paystack_secret",
];

function isPlaceholderSecret(secret: string): boolean {
  return PLACEHOLDER_MARKERS.some(m => secret.toLowerCase().includes(m));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.NODE_ENV === 'production' && isPlaceholderSecret(secret)) {
    console.error("paystack webhook rejected: PAYSTACK_SECRET_KEY looks like a placeholder in production");
    return NextResponse.json({ error: 'Misconfigured' }, { status: 503 });
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  const hashBuf = Buffer.from(hash, 'hex');
  const sigBuf = Buffer.from(signature, 'hex');

  if (hashBuf.length !== sigBuf.length || !crypto.timingSafeEqual(hashBuf, sigBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const status = await confirmChargeSuccess(event.data);
    return NextResponse.json({ status });
  }

  return NextResponse.json({ status: 'success' });
}
