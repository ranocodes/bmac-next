"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, ScanLine, User, Mail, CalendarDays, CheckCircle2, AlertTriangle, Loader2, Search, Camera } from "lucide-react";
import { checkInAttendee } from "@/actions/events";
import { useToast } from "@/components/ui/Toast";

interface CheckInEvent {
  id: string;
  title: string;
  date: string;
}

interface CheckInResult {
  checkedIn?: boolean;
  alreadyCheckedIn?: boolean;
  notFound?: boolean;
  notConfirmed?: boolean;
  wrongEvent?: boolean;
  wrongEventTitle?: string;
  checkedInAt?: string;
  attendeeName?: string;
  eventTitle?: string;
}

export default function CheckInClient({ events }: { events: CheckInEvent[] }) {
  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5Ref = useRef<unknown>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanCooldownRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function stopScanner() {
    try {
      const html5 = html5Ref.current as { stop?: () => Promise<void>; clear?: () => void } | null;
      if (html5?.stop) await html5.stop();
      html5Ref.current = null;
    } catch {
      // ignore
    }
    setScanning(false);
  }

  async function startScanner() {
    if (scanning) return;
    try {
      const mod = await import("html5-qrcode");
      const Html5Qrcode = mod.Html5Qrcode;
      const html5 = new Html5Qrcode("bmac-checkin-scanner");
      html5Ref.current = html5;
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) {
        toast("No camera found on this device", "error");
        return;
      }
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText: string) => {
          if (scanCooldownRef.current) return;
          scanCooldownRef.current = true;
          setTimeout(() => {
            scanCooldownRef.current = false;
          }, 1500);
          stopScanner();
          runCheckin(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      console.error("scanner start error:", err);
      toast("Camera could not start. Use manual search.", "error");
      setScanning(false);
    }
  }

  async function runCheckin(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (!selectedEventId) {
      setFlash({ ok: false, msg: "Pick an event before checking in" });
      return;
    }
    setBusy(true);
    setResult(null);
    setFlash(null);
    const token = trimmed.length > 30 ? trimmed : undefined;
    const reference = /^BMAC-EVT-/i.test(trimmed) ? trimmed : undefined;
    const email = trimmed.includes("@") ? trimmed : undefined;
    const res = await checkInAttendee({ token, reference, email, eventId: selectedEventId });
    setBusy(false);
    const r = res.result;
    if (res.error) {
      setFlash({ ok: false, msg: res.error });
      return;
    }
    setResult(r || null);
    if (r?.checkedIn) {
      setFlash({ ok: true, msg: "Checked in" });
    } else if (r?.alreadyCheckedIn) {
      setFlash({ ok: false, msg: "Already checked in" });
    } else if (r?.wrongEvent) {
      setFlash({ ok: false, msg: `Ticket is for another event${r.wrongEventTitle ? `: ${r.wrongEventTitle}` : ""}` });
    } else if (r?.notConfirmed) {
      setFlash({ ok: false, msg: "Pass not confirmed" });
    } else if (r?.notFound) {
      setFlash({ ok: false, msg: "No match found" });
    }
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCheckin(query);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-secondary flex items-center gap-3">
          <QrCode size={26} className="text-primary" /> Event Check-In
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Scan a pass QR, enter a reference, or search by email.</p>
      </div>

      <div className="bg-card rounded-3xl border border-border/50 p-6">
        <label className="block text-sm font-medium text-secondary mb-2">Event</label>
        <select
          value={selectedEventId}
          onChange={e => {
            setSelectedEventId(e.target.value);
            setResult(null);
            setFlash(null);
          }}
          className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Pick an event…</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.title}{e.date ? ` — ${e.date}` : ""}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-2">Tickets for other events are rejected with a clear message.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-secondary">Camera scanner</label>
              {scanning && (
                <button onClick={stopScanner} className="text-xs font-semibold text-muted-foreground hover:text-secondary underline">
                  Stop
                </button>
              )}
            </div>
            <div ref={scannerRef} className="relative rounded-2xl overflow-hidden bg-background border border-border/50 aspect-[4/3]">
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Camera size={24} />
                  <p className="text-sm">Camera preview appears here</p>
                </div>
              )}
              <div id="bmac-checkin-scanner" className={`w-full h-full ${scanning ? "" : "opacity-0 pointer-events-none"}`} />
            </div>
            {!scanning && (
              <button
                onClick={startScanner}
                className="flex items-center gap-2 h-11 px-5 rounded-xl border border-input bg-background text-sm font-semibold hover:bg-muted transition-colors mt-4"
              >
                <Camera size={16} /> Start camera scan
              </button>
            )}
          </div>

          <form onSubmit={onSubmit} className="bg-card rounded-3xl border border-border/50 p-6">
            <label className="block text-sm font-medium text-secondary mb-2">Manual search</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <ScanLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Token, reference (BMAC-EVT-…), or email"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={busy || !query.trim() || !selectedEventId}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Check In
              </button>
            </div>
          </form>

          {flash && (
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-semibold ${
              flash.ok ? "bg-green-500/10 border-green-500/30 text-green-600" : "bg-amber-500/10 border-amber-500/30 text-amber-600"
            }`}>
              {flash.ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} {flash.msg}
            </div>
          )}

          {result && (
            <div className="bg-card rounded-3xl border border-border/50 p-6">
              <h2 className="font-semibold text-secondary mb-4">Result</h2>
              {result.notFound ? (
                <p className="text-sm text-muted-foreground">No ticket matched that input.</p>
              ) : result.wrongEvent ? (
                <p className="text-sm text-amber-600 font-medium">
                  This ticket is for a different event{result.wrongEventTitle ? `: ${result.wrongEventTitle}` : ""}. Pick that event to check in this attendee.
                </p>
              ) : result.notConfirmed ? (
                <p className="text-sm text-amber-600 font-medium">This pass is not confirmed — it cannot be checked in.</p>
              ) : (
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-primary shrink-0" />
                    <dt className="text-muted-foreground w-24 shrink-0">Attendee</dt>
                    <dd className="font-semibold text-secondary">{result.attendeeName || "—"}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-primary shrink-0" />
                    <dt className="text-muted-foreground w-24 shrink-0">Event</dt>
                    <dd className="font-semibold text-secondary">{result.eventTitle || "—"}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.checkedIn ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
                    <dt className="text-muted-foreground w-24 shrink-0">Status</dt>
                    <dd className={`font-semibold ${result.checkedIn ? "text-green-600" : "text-amber-600"}`}>
                      {result.checkedIn ? "Checked in" : result.alreadyCheckedIn ? "Already checked in" : "—"}
                    </dd>
                  </div>
                  {result.checkedInAt && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-primary shrink-0" />
                      <dt className="text-muted-foreground w-24 shrink-0">Time</dt>
                      <dd className="font-semibold text-secondary">{new Date(result.checkedInAt).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          )}
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-6 h-fit">
          <h2 className="font-semibold text-secondary mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" /> Upcoming events
          </h2>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published events.</p>
          ) : (
            <ul className="space-y-2">
              {events.map(e => (
                <li key={e.id} className="px-3 py-2.5 rounded-xl bg-muted/50 text-sm">
                  <p className="font-medium text-secondary">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.date || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

