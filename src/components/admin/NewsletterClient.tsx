"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Mail, Send, Search, Users, Loader2, CheckCircle2, AlertCircle, Download, Upload, Plus, Trash2 } from "lucide-react";
import { sendNewsletterBroadcast, listNewsletterSubscribers, addNewsletterSubscriber, deleteNewsletterSubscriber, exportNewsletterSubscribers, importNewsletterSubscribers } from "@/actions/newsletter-admin";

interface SubscriberRow {
  email: string;
  source: string;
  active: boolean;
  createdAt: string;
  lastSentAt: string | null;
}

export default function NewsletterClient({ initialSubscribers }: { initialSubscribers: SubscriberRow[] }) {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>(initialSubscribers);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const rows = await listNewsletterSubscribers();
    setSubscribers(rows);
  }, []);

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
    load();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    const res = await addNewsletterSubscriber(addEmail);
    setAdding(false);
    if (res.error) {
      setResult({ ok: false, message: res.error });
      return;
    }
    setAddEmail("");
    setResult({ ok: true, message: `Added ${addEmail.trim().toLowerCase()}` });
    load();
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Delete subscriber ${email}?`)) return;
    const res = await deleteNewsletterSubscriber(email);
    if (res.error) {
      setResult({ ok: false, message: res.error });
      return;
    }
    setResult({ ok: true, message: `Deleted ${email}` });
    load();
  };

  const handleExport = async () => {
    const res = await exportNewsletterSubscribers();
    if (res.error || !res.csv) {
      setResult({ ok: false, message: res.error || "Nothing to export" });
      return;
    }
    const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    setImporting(true);
    setFileError("");
    const res = await importNewsletterSubscribers(text);
    setImporting(false);
    if (res.error) {
      setFileError(res.error);
      return;
    }
    setResult({ ok: true, message: `Imported ${res.added} subscriber(s), ${res.skipped} duplicate(s), ${res.invalid} invalid.` });
    load();
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <Mail size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Newsletter</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{subscribers.length} active subscriber(s)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2">
            <Send size={15} className="text-primary" /> Compose Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              required
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message body…"
              required
              rows={10}
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y"
            />
            {result && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                result.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-destructive/5 border border-destructive/20 text-destructive"
              }`}>
                {result.ok ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                <span>{result.message}</span>
              </div>
            )}
            <button
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Broadcast</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Users size={15} className="text-primary" /> Subscribers
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">{filtered.length}</span>
              <button
                onClick={handleExport}
                title="Export CSV"
                className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-secondary transition-colors"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="Add subscriber email…"
              className="flex-1 min-w-0 px-3 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              disabled={adding}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
            </button>
          </form>

          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails…"
              className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary transition-colors disabled:opacity-60"
            >
              {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Import CSV / list
            </button>
            <input ref={fileRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleImportFile} />
          </div>
          {fileError && (
            <p className="text-xs text-destructive mb-3">{fileError}</p>
          )}

          <div className="max-h-[420px] overflow-y-auto space-y-0.5">
            {filtered.slice(0, 100).map((s) => (
              <div key={s.email} className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{s.email}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {s.source} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {s.lastSentAt ? ` · last sent ${new Date(s.lastSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.email)}
                  title={`Delete ${s.email}`}
                  aria-label={`Delete ${s.email}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
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
