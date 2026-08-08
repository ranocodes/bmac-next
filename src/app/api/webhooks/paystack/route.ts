import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { findOrCreatePerson, ensurePersonRoles, upsertPersonRecord } from '@/actions/people';
import { sendDonationAlertEmail, sendDonationThanksEmail } from '@/lib/email';
import { createAdminNotification, getSuperAdminEmails } from '@/lib/notifications';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  const hashBuf = Buffer.from(hash, 'hex');
  const sigBuf = Buffer.from(signature, 'hex');

  if (hashBuf.length !== sigBuf.length || !crypto.timingSafeEqual(hashBuf, sigBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const { data } = event;
    const { reference, customer, metadata, amount, currency } = data;

    const existing = await db.query<{ id: string }>(
      "SELECT id FROM public.paystack_payments WHERE reference = $1",
      [reference]
    );

    if (existing.length > 0) {
      return NextResponse.json({ status: 'already_processed' });
    }

    const paymentId = `pay-${crypto.randomUUID()}`;
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
      id: `log-pay-${crypto.randomUUID()}`,
      user: "system",
      action: "payment_verified",
      resource: "paystack_payments",
      resource_id: paymentId,
      details: `Payment ${reference} verified: ${currency}${amount} from ${customer?.email}`,
    });

    const isDonation = metadata?.source_type === "donation";
    const payerEmail = customer?.email || "";
    const payerName = metadata?.payer_name || customer?.email || "";
    if (payerEmail) {
      const person = await findOrCreatePerson({
        firstName: metadata?.payer_name || payerEmail,
        email: payerEmail,
      });
      if (person) {
        await ensurePersonRoles(person.id, isDonation ? ["donor"] : ["attendee"]);
        await upsertPersonRecord(person.id, isDonation ? "donation" : "event_registration", {
          refId: reference,
          refTitle: isDonation ? "Donation" : metadata?.custom_fields?.[0]?.value || "",
          status: "completed",
          meta: { amount, currency, reference },
        });
      }
    }

    if (isDonation) {
      const amountN = Number(amount || 0);
      const amountLabel = `${currency === "NGN" ? "₦" : `${currency} `}${(amountN / 100).toLocaleString("en-NG", {
        maximumFractionDigits: 2,
      })}`;

      if (payerEmail) {
        const sent = await sendDonationThanksEmail({
          email: payerEmail,
          firstName: payerName,
          amountLabel,
          reference,
        });
        if (sent.error) console.error("donation-thanks email error:", sent.error);
      }

      const adminEmails = await getSuperAdminEmails();
      await Promise.all(
        adminEmails.map(adminEmail =>
          sendDonationAlertEmail({
            email: adminEmail,
            donorName: payerName,
            donorEmail: payerEmail,
            amountLabel,
            reference,
          }).catch(() => ({ error: "alert email failed" }))
        )
      );
      await createAdminNotification({
        title: "New donation received",
        message: `${payerName} donated ${amountLabel}${reference ? ` (${reference})` : ""}.`,
        type: "donation",
      });
    }
  }

  return NextResponse.json({ status: 'success' });
}
