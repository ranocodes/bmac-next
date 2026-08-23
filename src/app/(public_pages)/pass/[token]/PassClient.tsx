"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { ArrowLeft, CheckCircle2, AlertTriangle, Download } from "lucide-react";

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
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
        <AlertTriangle size={10} /> {ticket.status}
      </span>
    );
  }
  if (ticket.checked_in) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
        <CheckCircle2 size={10} /> Checked In
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
      <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-secondary break-words leading-snug" title={value}>{value}</p>
    </div>
  );
}

export default function PassClient({ ticket, qrDataUrl }: PassClientProps) {
  const passRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    if (!passRef.current) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const dataUrl = await toPng(passRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `bmac-pass-${ticket?.reference || "pass"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Pass download error:", err);
      setDownloadError("Could not generate the image. Try again.");
    } finally {
      setDownloading(false);
    }
  };

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
    <main className="min-h-screen bg-secondary/5 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-[360px] relative z-10">
        <Link href="/events" className="inline-flex items-center gap-2 text-secondary/60 hover:text-primary text-xs font-bold uppercase tracking-widest mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Events
        </Link>

        <div ref={passRef} className="relative rounded-2xl bg-background border border-border/60 shadow-xl shadow-secondary/10 overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-primary">BMAC · Entry Pass</p>
              <StatusPill ticket={ticket} />
            </div>
            <h1 className="mt-2.5 font-display text-lg font-bold tracking-tight text-secondary leading-snug">{ticket.event_title}</h1>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 pb-5">
            <Meta label="Date" value={formatDate(ticket.event_date)} />
            <Meta label="Venue" value={ticket.event_venue || "TBA"} />
            <Meta label="Attendee" value={ticket.payer_name || ticket.payer_email || "Guest"} />
            <Meta label="Admit" value={String(ticket.quantity)} />
          </div>

          {/* Perforation */}
          <div className="relative h-0">
            <div className="absolute left-[-12px] -top-3 w-6 h-6 rounded-full bg-secondary/5 border-r border-t border-border/60" />
            <div className="border-t border-dashed border-border/70 mx-5" />
            <div className="absolute right-[-12px] -top-3 w-6 h-6 rounded-full bg-secondary/5 border-l border-t border-border/60" />
          </div>

          {/* QR */}
          <div className="flex flex-col items-center px-5 pt-4 pb-5">
            <div className="p-2.5 bg-white rounded-xl border border-border/50 shadow-sm">
              {inactive ? (
                <div className="flex flex-col items-center justify-center gap-2 w-[132px] h-[132px] text-center">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                  <p className="text-xs font-bold text-secondary">Pass not active.</p>
                </div>
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Entry QR code" width={132} height={132} className="rounded-lg" />
              ) : (
                <div className="w-[132px] h-[132px] flex items-center justify-center">
                  <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="mt-3 font-mono text-[11px] font-semibold tracking-widest text-secondary/70">{ticket.reference}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary text-background px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-secondary/20"
        >
          <Download size={14} /> {downloading ? "Preparing…" : "Save Pass"}
        </button>
        {downloadError && <p className="mt-2 text-center text-red-500 text-xs font-bold">{downloadError}</p>}

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
