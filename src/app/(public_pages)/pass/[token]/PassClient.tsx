"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { ArrowLeft, Calendar, MapPin, User, Ticket, CheckCircle2, AlertTriangle, Download } from "lucide-react";

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
      
      <div className="w-full max-w-sm relative z-10">
        <Link href="/events" className="inline-flex items-center gap-2 text-secondary/60 hover:text-primary text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Events
        </Link>

        <div ref={passRef} className="relative rounded-3xl bg-background/60 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-8 pb-6 bg-secondary/5 border-b border-border/40 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">BMAC Digital Pass</p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-secondary leading-tight">{ticket.event_title}</h1>
            </div>
            <div className="shrink-0 mt-1">
              <StatusPill ticket={ticket} />
            </div>
          </div>

          {/* Card body details */}
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</p>
                <p className="font-semibold text-secondary text-sm">{formatDate(ticket.event_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Venue</p>
                <p className="font-semibold text-secondary text-sm">{ticket.event_venue || "TBA"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center shrink-0">
                <User size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attendee</p>
                <p className="font-semibold text-secondary text-sm">{ticket.payer_name || ticket.payer_email || "Guest"}</p>
              </div>
            </div>
          </div>

          {/* Separator line with side cutouts */}
          <div className="relative h-6 flex items-center">
            <div className="absolute left-[-12px] w-6 h-6 rounded-full bg-secondary/5 border-r border-border/40" />
            <div className="w-full border-t-[2px] border-dashed border-border/60 mx-4" />
            <div className="absolute right-[-12px] w-6 h-6 rounded-full bg-secondary/5 border-l border-border/40" />
          </div>

          {/* QR Code Section */}
          <div className="px-6 pb-8 pt-4 flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-border/40 mb-4">
              {inactive ? (
                <div className="flex flex-col items-center justify-center gap-3 w-[200px] h-[200px] text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500" />
                  <p className="text-sm font-bold text-secondary">Pass not active.</p>
                </div>
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Entry QR code" width={200} height={200} className="rounded-xl" />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex flex-col items-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ticket ID</p>
                <p className="text-xs font-mono font-semibold text-secondary">{ticket.reference}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Admit</p>
                <p className="text-xs font-semibold text-secondary">{ticket.quantity}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary text-background px-5 py-4 text-xs font-bold uppercase tracking-widest transition-transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-secondary/20"
        >
          <Download size={16} /> {downloading ? "Preparing…" : "Add to Device / Save Image"}
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
