import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { findOrCreatePerson, ensurePersonRoles, upsertPersonRecord } from '@/actions/people';
import { sendDonationAlertEmail, sendDonationThanksEmail, sendTicketReceiptEmail, sendTicketAlertEmail } from '@/lib/email';
import { sendWorkflowEmail } from '@/actions/emails';
import { createAdminNotification, getSuperAdminEmails, emailSuperAdmins } from '@/lib/notifications';

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

    const isEventTicket = metadata?.source_type === "event_ticket";
    if (isEventTicket) {
      const ticketRows = await db.query<{
        id: string;
        event_id: string;
        reference: string;
        qr_token: string;
        payer_name: string;
        payer_email: string;
        quantity: number;
        status: string;
      }>(
        `SELECT id, event_id, reference, qr_token, payer_name, payer_email, quantity, status
         FROM public.event_tickets
         WHERE id = $1 OR reference = $2
         ORDER BY (id = $1) DESC
         LIMIT 1`,
        [metadata?.ticket_id || "", metadata?.reference || reference]
      );
      const ticket = ticketRows[0];
      if (!ticket || ticket.status === "confirmed") {
        return NextResponse.json({ status: 'already_processed' });
      }
      const confirmed = await db.query<{ id: string }>(
        `UPDATE public.event_tickets
            SET status = 'confirmed', updated_at = now()
          WHERE id = $1 AND status <> 'confirmed'
          RETURNING id`,
        [ticket.id]
      );
      if (confirmed.length) {
        await db.query(
          "UPDATE public.person_records SET status = 'completed' WHERE ref_id = $1 AND kind = 'event_registration'",
          [ticket.reference]
        );
        await db.create("activity_logs", {
          id: `log-ticket-${crypto.randomUUID()}`,
          user: "system",
          action: "ticket_confirmed",
          resource: "event_tickets",
          resource_id: ticket.id,
          details: `Ticket ${ticket.reference} confirmed after payment verification`,
        });
        const eventRows = await db.query<{ title: string }>(
          "SELECT title FROM public.events WHERE id = $1",
          [ticket.event_id]
        );
        const eventTitle = eventRows[0]?.title || "Event";
        const passUrl = ticket.qr_token
          ? `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || ""}/pass/${ticket.qr_token}`
          : "";
        const amountN = Number(amount || 0);
        const amountLabel = `${currency === "NGN" ? "₦" : `${currency} `}${(amountN / 100).toLocaleString("en-NG", {
          maximumFractionDigits: 2,
        })}`;
        await sendTicketReceiptEmail({
          email: ticket.payer_email || customer?.email || "",
          firstName: ticket.payer_name?.split(" ")[0] || "",
          eventName: eventTitle,
          quantity: ticket.quantity,
          amountLabel,
          passUrl,
          reference: ticket.reference,
        }).catch(err => console.error("ticket-receipt email error:", err));
        await createAdminNotification({
          title: "Paid ticket confirmed",
          message: `${ticket.payer_name || customer?.email} confirmed for ${eventTitle} (${ticket.reference}).`,
          type: "ticket",
          link: "/admin/events",
        });
        await emailSuperAdmins(adminEmail =>
          sendTicketAlertEmail({
            email: adminEmail,
            attendeeName: ticket.payer_name || customer?.email || "",
            attendeeEmail: ticket.payer_email || customer?.email || "",
            eventName: eventTitle,
            amountLabel,
            reference: ticket.reference,
          })
        );
        await db.query(
          `UPDATE public.workflow_records
              SET status = 'resolved', outcome = 'Payment verified, ticket confirmed', resolved_at = now(), updated_at = now()
            WHERE kind = 'ticket' AND ref_id = $1 AND status IN ('open', 'in_progress')`,
          [ticket.id]
        );
      }
      return NextResponse.json({ status: 'success' });
    }

    const isProgram = metadata?.source_type === "program";
    if (isProgram) {
      const appRows = await db.query<{
        id: string;
        program_id: string;
        person_id: string;
      }>(
        `SELECT id, program_id, person_id
         FROM public.program_applications
         WHERE payment_reference = $1 OR id = $2
         ORDER BY (id = $2) DESC
         LIMIT 1`,
        [reference, metadata?.application_id || ""]
      );
      const app = appRows[0];
      if (!app) {
        return NextResponse.json({ status: 'already_processed' });
      }
      await db.query(
        `UPDATE public.workflow_records
            SET status = 'resolved', outcome = 'Payment verified, application received', resolved_at = now(), updated_at = now()
          WHERE kind = 'program' AND ref_id = $1 AND status IN ('open', 'in_progress')`,
        [app.id]
      );
      const personRows = await db.query<{ first_name: string; last_name: string; email: string }>(
        "SELECT first_name, last_name, email FROM public.people WHERE id = $1",
        [app.person_id]
      );
      const person = personRows[0];
      const programRows = await db.query<{ title: string }>(
        "SELECT title FROM public.programs WHERE id = $1",
        [app.program_id]
      );
      const programTitle = programRows[0]?.title || "Program";
      if (person?.email) {
        await sendWorkflowEmail(
          "program",
          person.email,
          `${person.first_name || ""} ${person.last_name || ""}`.trim(),
          { programTitle, applicationId: app.id, status: "received" }
        ).catch(err => console.error("program-receipt email error:", err));
      }
      await createAdminNotification({
        title: "Paid program application",
        message: `${metadata?.payer_name || person?.email || "Applicant"} paid & applied to ${programTitle} (${reference}).`,
        type: "program",
        link: `/admin/programs/${app.program_id}`,
      });
      return NextResponse.json({ status: 'success' });
    }

    const isDonation = metadata?.source_type === "donation";
    const payerEmail = customer?.email || "";
    const payerName = metadata?.payer_name || customer?.email || "";
    if (payerEmail) {

      const expected = await db.query<{ meta: { amount?: number; currency?: string } | null }>(
        `SELECT meta
         FROM public.person_records
         WHERE kind = 'donation' AND ref_id = $1 AND status = 'pending'
         LIMIT 1`,
        [reference]
      );

      const expectedMeta = expected[0]?.meta;
      if (expectedMeta && expectedMeta.amount != null) {
        const webhookAmount = Number(amount || 0);
        const expectedAmount = Number(expectedMeta.amount) * 100;
        const tolerance = Math.max(Math.round(expectedAmount * 0.01), 1);
        if (Math.abs(webhookAmount - expectedAmount) > tolerance) {
          await createAdminNotification({
            title: "Donation amount mismatch",
            message: `Webhook ${reference} reports ${currency}${amount}, expected ~${expectedMeta.currency || "NGN"}${expectedAmount}. Manual review needed.`,
            type: "donation",
            link: "/admin/payments",
          });
          console.error(`donation amount mismatch for ${reference}: webhook ${amount} vs expected ${expectedAmount}`);
          return NextResponse.json({ status: 'success' });
        }
      }

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
        const updated = await db.query<{ id: string }>(
          `UPDATE public.person_records
              SET status = 'completed',
                  meta = jsonb_set(jsonb_set(jsonb_set(meta, '{amount}', to_jsonb($2::numeric), true),
                                            '{currency}', to_jsonb($3::text), true),
                                            '{verified_at}', to_jsonb($4::text), true),
                  updated_at = now()
            WHERE kind = 'donation' AND ref_id = $1 AND status = 'pending'
            RETURNING id`,
          [reference, amount, currency, new Date().toISOString()]
        );
        if (!updated.length) {
          const person = await findOrCreatePerson({ firstName: payerName, email: payerEmail });
          if (person) {
            await ensurePersonRoles(person.id, ["donor"]);
            await upsertPersonRecord(person.id, "donation", {
              refId: reference,
              refTitle: "Donation",
              status: "completed",
              meta: { amount, currency, reference },
            });
          }
        }
      }

      if (payerEmail) {
        const sent = await sendDonationThanksEmail({
          email: payerEmail,
          firstName: payerName,
          amountLabel,
          reference,
        });
        if (sent.error) {
          console.error("donation-thanks email error:", sent.error);
          await createAdminNotification({
            title: "Donation thank-you email failed",
            message: `Receipt email to ${payerEmail} for ${reference} failed: ${sent.error}`,
            type: "donation",
            link: "/admin/payments",
          });
        }
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
          }).catch(err => {
            console.error("donation-alert email error:", err);
          })
        )
      );
      await createAdminNotification({
        title: "New donation received",
        message: `${payerName} donated ${amountLabel}${reference ? ` (${reference})` : ""}.`,
        type: "donation",
        link: "/admin/payments",
      });
    }
  }

  return NextResponse.json({ status: 'success' });
}
