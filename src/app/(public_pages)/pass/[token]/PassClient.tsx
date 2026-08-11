"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, User, Ticket, CheckCircle2, AlertTriangle, QrCode } from "lucide-react";

interface PassTicket {
  id: string;
  reference: string;
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

interface PassClientProps {
  ticket: PassTicket | null;
  qrDataUrl: string | null;
}

function formatDate(raw: string): string {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    if (!isNaN(d.getTime())) return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return raw;
}

export default function PassClient({ ticket, qrDataUrl }: PassClientProps) {
  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-extrabold mb-2">Pass Not Found</h1>
          <p className="text-secondary/70 mb-6">This pass link is invalid or has been revoked.</p>
          <Link href="/events" className="text-primary font-bold underline">Back to Events</Link>
        </div>
      </div>
    );
  }

  const inactive = ticket.status !== "confirmed";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <Link href="/events" className="inline-flex items-center gap-2 text-secondary/60 hover:text-primary text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Events
        </Link>

        <div className="bg-gradient-to-br from-primary via-primary to-secondary rounded-[2rem] p-8 text-card shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Digital Pass</span>
              {inactive ? (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  {ticket.status}
                </span>
              ) : ticket.checked_in ? (
                <span className="bg-green-400 text-green-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  Checked In
                </span>
              ) : (
                <span className="bg-emerald-300 text-emerald-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">{ticket.event_title}</h1>
            <p className="text-card/70 text-sm font-medium mb-8 flex items-center gap-1.5">
              <Calendar size={14} /> {formatDate(ticket.event_date)}
              <MapPin size={14} className="ml-3" /> {ticket.event_venue || "—"}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-card/15 border border-card/20 flex items-center justify-center shrink-0">
                <User size={24} />
              </div>
              <div>
                <p className="text-card/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Attendee</p>
                <p className="font-bold text-base">{ticket.payer_name || ticket.payer_email || "—"}</p>
              </div>
            </div>

            <div className="bg-card/10 border border-card/20 rounded-3xl p-6 mb-6 flex flex-col items-center">
              <QrCode className="w-6 h-6 text-accent mb-3" />
              {inactive ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <AlertTriangle className="w-10 h-10 text-amber-300" />
                  <p className="text-sm font-bold text-center">This pass is not active. Contact the event organizers.</p>
                </div>
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Entry QR code" width={200} height={200} className="rounded-2xl bg-white p-3" />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-card/40 border-t-card rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-card/70 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Ticket size={13} /> {ticket.reference}
              </span>
              <span>×{ticket.quantity}</span>
            </div>
          </div>
        </div>

        {ticket.checked_in && ticket.checked_in_at && (
          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-bold justify-center">
            <CheckCircle2 size={16} /> Checked in on {new Date(ticket.checked_in_at).toLocaleString()}
          </div>
        )}

        <p className="text-center text-secondary/40 text-xs mt-6">Present this QR code at the venue entrance.</p>
      </div>
    </main>
  );
}
