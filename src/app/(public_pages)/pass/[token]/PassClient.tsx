"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, User, Ticket, CheckCircle2, AlertTriangle } from "lucide-react";

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

function StatusPill({ ticket }: { ticket: PassTicket }) {
  const inactive = ticket.status !== "confirmed";
  if (inactive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider">
        <AlertTriangle size={12} /> {ticket.status}
      </span>
    );
  }
  if (ticket.checked_in) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-bold uppercase tracking-wider">
        <CheckCircle2 size={12} /> Checked In
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
    </span>
  );
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

        <div className="bg-white border border-border rounded-3xl shadow-sm">
          <div className="px-6 pt-6 pb-5 border-b border-border/60 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2">Digital Pass</p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">{ticket.event_title}</h1>
            </div>
            <StatusPill ticket={ticket} />
          </div>

          <div className="px-6 py-5 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar size={15} className="text-muted-foreground shrink-0" />
              <span className="text-secondary">{formatDate(ticket.event_date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={15} className="text-muted-foreground shrink-0" />
              <span className="text-secondary">{ticket.event_venue || "—"}</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attendee</p>
                <p className="font-semibold text-secondary">{ticket.payer_name || ticket.payer_email || "—"}</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-border bg-background/50 p-5 flex flex-col items-center">
              {inactive ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500" />
                  <p className="text-sm font-bold text-secondary">This pass is not active. Contact the event organizers.</p>
                </div>
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Entry QR code" width={200} height={200} className="rounded-xl bg-white p-3 border border-border" />
              ) : (
                <div className="w-48 h-48 rounded-xl bg-white flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Ticket size={13} /> {ticket.reference}
            </span>
            <span>×{ticket.quantity}</span>
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
