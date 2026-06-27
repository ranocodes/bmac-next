import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const { data } = event;
    const { reference, customer, metadata, amount, currency } = data;

    const existing = await db.query<any>(
      "SELECT id FROM public.paystack_payments WHERE reference = $1",
      [reference]
    );

    if (existing.length > 0) {
      return NextResponse.json({ status: 'already_processed' });
    }

    const paymentId = `pay-${Date.now()}`;
    await db.create("paystack_payments", {
      id: paymentId,
      reference,
      source_type: metadata?.source_type || "unknown",
      source_id: metadata?.source_id || "",
      amount,
      currency: currency || "NGN",
      payer_email: customer?.email || "",
      payer_name: metadata?.payer_name || customer?.email || "",
      status: "completed",
      metadata: { ...metadata, verified_at: new Date().toISOString() },
    });

    await db.create("activity_logs", {
      id: `log-pay-${Date.now()}`,
      user: "system",
      action: "payment_verified",
      resource: "paystack_payments",
      resource_id: paymentId,
      details: `Payment ${reference} verified: ${currency}${amount} from ${customer?.email}`,
    });
  }

  return NextResponse.json({ status: 'success' });
}
