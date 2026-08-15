"use client";

import { useMemo, useState } from "react";
import { Mail, Send, Search, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendNewsletterBroadcast } from "@/actions/newsletter-admin";

interface SubscriberRow {
  email: string;
  source: string;
  active: boolean;
  createdAt: string;
  lastSentAt: string | null;
}

export default function NewsletterClient({ initialSubscribers }: { initialSubscribers: SubscriberRow[] }) {
  const [subscribers] = useState<SubscriberRow[]>(initialSubscribers);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const filtered = useMemo(() => {
    if (!search) return subscribers;
    return subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
  }, [subscribers, search]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setResult(null);
    const res = await sendNewsletterBroadcast({ subject, body });
    setSending(false);
    if (res.error) {
      setResult({ ok: false, message: res.error });
      return;
    }
    setResult({ ok: true, message: `Broadcast sent to ${res.sent} subscriber(s).${res.errors ? ` ${res.errors} failed.` : ""}` });
    setSubject("");
    setBody("");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Mail size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary">Newsletter</h1>
          <p className="text-sm text-muted-foreground">{subscribers.length} active subscriber(s)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card rounded-bento border border-border/50 p-6">
          <h2 className="font-display text-lg font-bold text-secondary mb-4 flex items-center gap-2">
            <Send size={16} className="text-primary" /> Compose Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              required
              className="w-full px-4 py-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message body…"
              required
              rows={10}
              className="w-full px-4 py-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y"
            />
            {result && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                result.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700" : "bg-destructive/10 border border-destructive/20 text-destructive"
              }`}>
                {result.ok ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                <span>{result.message}</span>
              </div>
            )}
            <button
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Broadcast</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-card rounded-bento border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-secondary flex items-center gap-2">
              <Users size={16} className="text-primary" /> Subscribers
            </h2>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{filtered.length}</span>
          </div>
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails…"
              className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="max-h-[420px] overflow-y-auto space-y-1.5">
            {filtered.slice(0, 100).map((s) => (
              <div key={s.email} className="px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm font-semibold text-secondary truncate">{s.email}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {s.source} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {s.lastSentAt ? ` · last sent ${new Date(s.lastSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No subscribers yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
