import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the webhook signature to ensure it's from Paystack
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const { data } = event;
    const { reference, customer, metadata } = data;

    console.log(`SECURE PAYMENT VERIFIED: ${reference}`);
    
    console.log(`Registration data: ${metadata.event_title}, ${metadata.attendee_name}, ${customer.email}, ${reference}`);
  }

  return NextResponse.json({ status: 'success' });
}
