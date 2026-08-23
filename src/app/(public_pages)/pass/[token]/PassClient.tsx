"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { ArrowLeft, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

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
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF3E4] text-[#8A6116] border border-[#EFE0C2] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
        <AlertTriangle size={10} /> {ticket.status}
      </span>
    );
  }
  if (ticket.checked_in) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF5EC] text-[#3E6B44] border border-[#D8E7D7] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
        <CheckCircle2 size={10} /> Checked In
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1F6] text-[#1F6C9F] border border-[#D5E3EE] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
      <span className="h-1 w-1 rounded-full bg-[#1F6C9F]" /> Active
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-secondary" title={value}>{value}</p>
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
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl text-secondary mb-2" style={{ fontFamily: "var(--font-editorial), Georgia, serif" }}>
            Pass Not Found
          </h1>
          <p className="text-muted-foreground mb-6">This pass link is invalid or has been revoked.</p>
          <Link href="/events" className="inline-block rounded-md bg-secondary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-background">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const inactive = ticket.status !== "confirmed";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 md:p-8">
      <div className="w-full max-w-[380px]">
        <Link href="/events" className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-secondary transition-colors">
          <ArrowLeft size={13} /> Back to Events
        </Link>

        <div ref={passRef} className="overflow-hidden rounded-xl border border-border bg-white">
          {/* Header */}
          <div className="border-b border-border px-6 pb-5 pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary">BMAC · Entry Pass</p>
              <StatusPill ticket={ticket} />
            </div>
            <h1
              className="mt-2.5 text-[22px] leading-snug tracking-tight text-secondary"
              style={{ fontFamily: "var(--font-editorial), Georgia, serif", fontWeight: 400 }}
            >
              {ticket.event_title}
            </h1>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-px bg-border">
            <div className="bg-white px-6 py-4"><Meta label="Date" value={formatDate(ticket.event_date)} /></div>
            <div className="bg-white px-6 py-4"><Meta label="Venue" value={ticket.event_venue || "TBA"} /></div>
            <div className="col-span-2 bg-white px-6 py-4"><Meta label="Attendee" value={ticket.payer_name || ticket.payer_email || "Guest"} /></div>
            <div className="col-span-2 bg-white px-6 py-4"><Meta label="Admit" value={`${ticket.quantity} ${ticket.quantity === 1 ? "person" : "people"}`} /></div>
          </div>

          {/* Perforation */}
          <div className="relative h-0">
            <div className="absolute left-[-12px] -top-3 h-6 w-6 rounded-full border border-r-0 border-l-0 border-t-0 border-border bg-[#F7F6F3]" />
            <div className="mx-6 border-t border-dashed border-border" />
            <div className="absolute right-[-12px] -top-3 h-6 w-6 rounded-full border border-r-0 border-l-0 border-t-0 border-border bg-[#F7F6F3]" />
          </div>

          {/* QR */}
          <div className="flex flex-col items-center px-6 pb-6 pt-6">
            {inactive ? (
              <div className="flex h-[148px] w-[148px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs font-semibold text-secondary">Pass not active.</p>
              </div>
            ) : qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Entry QR code" width={148} height={148} className="rounded-lg border border-border p-2.5" />
            ) : (
              <Skeleton className="h-[148px] w-[148px] rounded-lg" aria-label="Generating QR code" />
            )}
            <p className="mt-4 font-mono text-[11px] font-medium tracking-[0.2em] text-muted-foreground">{ticket.reference}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          <Download size={14} /> {downloading ? "Preparing…" : "Save Pass"}
        </button>
        {downloadError && <p className="mt-2 text-center text-red-500 text-xs font-semibold">{downloadError}</p>}

        {ticket.checked_in && ticket.checked_in_at && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
            <CheckCircle2 size={16} /> Checked in on {new Date(ticket.checked_in_at).toLocaleString()}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">Present this QR code at the venue entrance.</p>
      </div>
    </main>
  );
}
