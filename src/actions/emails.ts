"use server";

import {
  sendContactAutoreplyEmail,
  sendFormSubmitAlertEmail,
  sendDonationThanksEmail,
  sendDonationAlertEmail,
  sendTicketReceiptEmail,
  sendRegistrationConfirmedEmail,
  sendApplicationStatusEmail as libSendApplicationStatusEmail,
  sendEventReminderEmail as libSendEventReminderEmail,
} from "@/lib/email";

export type WorkflowKind =
  | "contact"
  | "member"
  | "volunteer"
  | "partner"
  | "program"
  | "event_registration"
  | "donation"
  | "ticket"
  | "application-status";

export async function sendWorkflowEmail(
  kind: WorkflowKind,
  email: string,
  firstName: string,
  opts: {
    programTitle?: string;
    applicationId?: string;
    status?: string;
    cohortTitle?: string;
    action?: string;
    eventTitle?: string;
    eventDate?: string;
    passUrl?: string;
    reference?: string;
    amountLabel?: string;
    donorName?: string;
    donorEmail?: string;
  } = {}
): Promise<{ sent: boolean; error?: string }> {
  if (!email) return { sent: false, error: "No email provided" };

  try {
    switch (kind) {
      case "contact": {
        const sent = await sendContactAutoreplyEmail({
          email,
          firstName,
        });
        return { sent: !sent.error, error: sent.error };
      }
      case "member":
      case "volunteer":
      case "partner": {
        const sent = await sendFormSubmitAlertEmail({
          email,
          submitterName: firstName,
          submitterEmail: email,
          kindLabel: kind,
        });
        return { sent: !sent.error, error: sent.error };
      }
      case "program": {
        if (opts.action === "accepted" && opts.cohortTitle) {
          const sent = await libSendApplicationStatusEmail({
            email,
            firstName,
            kindLabel: opts.programTitle || "",
            status: "accepted",
          });
          return { sent: !sent.error, error: sent.error };
        }
        const sent = await libSendApplicationStatusEmail({
          email,
          firstName,
          kindLabel: opts.programTitle || "",
          status: "received",
        });
        return { sent: !sent.error, error: sent.error };
      }
      case "event_registration": {
        const sent = await sendRegistrationConfirmedEmail({
          email,
          firstName,
          eventName: opts.eventTitle || "",
          passUrl: opts.passUrl || "",
        });
        return { sent: !sent.error, error: sent.error };
      }
      case "donation": {
        const sent = await sendDonationThanksEmail({
          email,
          firstName,
          amountLabel: opts.amountLabel || "",
          reference: opts.reference || "",
        });
        return { sent: !sent.error, error: sent.error };
      }
      case "ticket": {
        const sent = await sendTicketReceiptEmail({
          email,
          firstName,
          eventName: opts.eventTitle || "",
          quantity: 1,
          amountLabel: opts.amountLabel || "",
          passUrl: opts.passUrl || "",
          reference: opts.reference || "",
        });
        return { sent: !sent.error, error: sent.error };
      }
      default:
        return { sent: false, error: `Unknown workflow kind: ${kind}` };
    }
  } catch (err) {
    console.error(`sendWorkflowEmail (${kind}) error:`, err);
    return { sent: false, error: "Email dispatch failed" };
  }
}

export async function sendApplicationStatusEmail(input: {
  email: string;
  firstName: string;
  programTitle: string;
  status: "received" | "accepted" | "waitlisted" | "rejected" | "withdrawn";
  cohortTitle?: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!input.email) return { sent: false, error: "No email provided" };

  try {
    const sent = await libSendApplicationStatusEmail({
      email: input.email,
      firstName: input.firstName,
      kindLabel: input.programTitle,
      status: input.status,
    });
    return { sent: !sent.error, error: sent.error };
  } catch (err) {
    console.error("sendApplicationStatusEmail error:", err);
    return { sent: false, error: "Email dispatch failed" };
  }
}

export async function sendEventReminderEmail(input: {
  email: string;
  firstName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!input.email) return { sent: false, error: "No email provided" };

  try {
    const sent = await libSendEventReminderEmail({
      email: input.email,
      firstName: input.firstName,
      eventName: input.eventTitle,
      eventDate: input.eventDate,
      eventLocation: input.eventVenue,
    });
    return { sent: !sent.error, error: sent.error };
  } catch (err) {
    console.error("sendEventReminderEmail error:", err);
    return { sent: false, error: "Email dispatch failed" };
  }
}