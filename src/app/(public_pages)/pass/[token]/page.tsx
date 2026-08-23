import { db } from "@/lib/db";
import type { Metadata } from "next";
import PassClient from "./PassClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Pass",
  robots: { index: false, follow: false },
};

interface PassRow {
  id: string;
  reference: string;
  qr_token: string;
  payer_name: string;
  payer_email: string;
  quantity: number;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  event_title: string;
  event_date: string;
  event_venue: string;
}

export default async function PassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await db.query<PassRow>(
    `SELECT t.id, t.reference, t.qr_token, t.payer_name, t.payer_email, t.quantity, t.status,
            t.checked_in, t.checked_in_at, t.created_at,
            e.title AS event_title, e.date AS event_date, e.venue AS event_venue
     FROM public.event_tickets t
     JOIN public.events e ON e.id = t.event_id
     WHERE t.qr_token = $1`,
    [token]
  );

  const ticket = rows[0] || null;

  let qrDataUrl: string | null = null;
  if (ticket && ticket.status === "confirmed") {
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "";
      const passUrl = `${base}/pass/${token}`;
      const QRCode = (await import("qrcode")).default;
      qrDataUrl = await QRCode.toDataURL(passUrl);
    } catch (err) {
      console.error("QR generation error:", err);
    }
  }

  return <PassClient ticket={ticket} qrDataUrl={qrDataUrl} />;
}
