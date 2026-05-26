import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { insertRegistration } from '@/lib/supabase';

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
    
    // Store in Supabase
    await insertRegistration({
      event_title: metadata.event_title,
      attendee_name: metadata.attendee_name,
      email: customer.email,
      amount: data.amount / 100, // Convert back from Kobo to Naira
      reference: reference
    });
  }

  return NextResponse.json({ status: 'success' });
}
