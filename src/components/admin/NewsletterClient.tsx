"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, Loader2, CheckCircle2, AlertCircle, Users,
  Plus, Trash2, Search, X, Ban, Clock, Eye, EyeOff,
} from "lucide-react";
import {
  sendNewsletterBroadcast,
  sendNewsletterTest,
  listNewsletterSubscribers,
  addNewsletterSubscriber,
  deleteNewsletterSubscriber,
  scheduleNewsletterBroadcast,
  listBroadcastHistory,
  cancelNewsletterBroadcast,
} from "@/actions/newsletter-admin";
import type {
  NewsletterSubscriber,
  Broadcast,
} from "@/actions/newsletter-admin";
import NewsletterHistory from "@/components/admin/NewsletterHistory";

const PAGE_SIZE = 50;

interface Feedback {
  type: "success" | "error";
  message: string;
}

export default function NewsletterClient({
  initialSubscribers,
  initialTotal,
  initialBroadcasts,
}: {
  initialSubscribers: NewsletterSubscriber[];
  initialTotal: number;
  initialBroadcasts: Broadcast[];
}) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(initialBroadcasts);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAudienceCount, setConfirmAudienceCount] = useState(0);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmails, setTestEmails] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<Feedback | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadSubscribers = useCallback(async () => {
    try {
      const res = await listNewsletterSubscribers({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: searchQuery || undefined,
      });
      setSubscribers(res.rows);
      setTotal(res.total);
    } catch {
      setFeedback({ type: "error", message: "Failed to load subscribers" });
    }
  }, [page, searchQuery]);

  const loadHistory = useCallback(async () => {
    try {
      const rows = await listBroadcastHistory();
      setBroadcasts(rows);
    } catch {}
  }, []);

  useEffect(() => { loadSubscribers(); }, [loadSubscribers]);

  useEffect(() => {
    const t = setTimeout(() => loadSubscribers(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setFeedback(null);
    setProgress({ sent: 0, total: 0 });

    let totalSent = 0;
    let totalErrors = 0;
    let totalCount = 0;
    let campaignId = "";
    let offset = 0;
    const CHUNK = 100;

    try {
      while (true) {
        const res = await sendNewsletterBroadcast({
          subject,
          body,
          bodyHtml: body,
          offset,
          limit: CHUNK,
          campaignId: campaignId || undefined,
        });
        if (res.error) {
          setFeedback({ type: "error", message: res.error });
          break;
        }
        campaignId = res.campaignId;
        totalCount = res.total;
        totalSent += res.sent;
        totalErrors += res.errors;
        setProgress({ sent: totalSent, total: totalCount });
        if (res.done) break;
        offset += CHUNK;
      }
    } catch {
      setFeedback({ type: "error", message: "Send failed" });
    }

    setSending(false);
    setProgress(null);

    if (totalSent > 0) {
      const msg = totalErrors > 0
        ? `Sent ${totalSent}/${totalCount} (${totalErrors} errors)`
        : `Sent ${totalSent} newsletter(s)`;
      setFeedback({ type: "success", message: msg });
      setSubject("");
      setBody("");
    }

    loadSubscribers();
    loadHistory();
  };

  const handleTestSend = async () => {
    if (!testEmails.trim()) return;
    setSendingTest(true);
    setTestFeedback(null);
    const res = await sendNewsletterTest({ subject, body, bodyHtml: body, to: testEmails });
    setSendingTest(false);
    if (res.error) {
      setTestFeedback({ type: "error", message: res.error });
    } else {
      setTestFeedback({
        type: "success",
        message: `Test sent to ${res.sent} address(es).${res.errors ? ` ${res.errors} failed.` : ""}`,
      });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding || !addEmail.trim()) return;
    setAdding(true);
    const res = await addNewsletterSubscriber(addEmail);
    setAdding(false);
    if (res.error) {
      setFeedback({ type: "error", message: res.error });
      return;
    }
    setAddEmail("");
    setFeedback({ type: "success", message: `Added ${addEmail.trim().toLowerCase()}` });
    loadSubscribers();
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Delete subscriber ${email}?`)) return;
    const res = await deleteNewsletterSubscriber(email);
    if (res.error) {
      setFeedback({ type: "error", message: res.error });
      return;
    }
    setFeedback({ type: "success", message: `Deleted ${email}` });
    loadSubscribers();
  };

  const openConfirm = async () => {
    if (!subject.trim() || !body.trim()) {
      setFeedback({ type: "error", message: "Subject and body required" });
      return;
    }
    try {
      const res = await listNewsletterSubscribers({ limit: 1 });
      setConfirmAudienceCount(res.total);
    } catch {
      setConfirmAudienceCount(0);
    }
    setShowConfirm(true);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <Mail size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Newsletter</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{total} active subscriber(s)</p>
        </div>
      </div>

      {/* History toggle */}
      <button
        onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted/60 transition-colors"
      >
        <Clock size={13} /> {showHistory ? "Hide" : "Show"} History
      </button>

      {showHistory && (
        <NewsletterHistory
          broadcasts={broadcasts}
          onCancel={async (id) => {
            await cancelNewsletterBroadcast(id);
            loadHistory();
          }}
        />
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose — left side */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
            <h2 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
              <Send size={15} className="text-primary" /> Compose Broadcast
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-secondary/80 mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Newsletter subject line"
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary/80 mb-1.5">Body * (HTML supported)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={14}
                  placeholder="Write your newsletter content here. HTML is supported for formatting."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y font-mono leading-relaxed placeholder:text-muted-foreground/30"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tip: Use HTML tags for formatting (e.g. &lt;h2&gt;, &lt;p&gt;, &lt;a href="..."&gt;, &lt;strong&gt;)
                </p>
              </div>
            </div>

            {feedback && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mt-4 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-destructive/5 border border-destructive/20 text-destructive"
              }`}>
                {feedback.type === "success"
                  ? <CheckCircle2 size={16} className="shrink-0" />
                  : <AlertCircle size={16} className="shrink-0" />}
                <span>{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-auto"><X size={12} /></button>
              </div>
            )}

            {progress && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Sending…</span>
                  <span>{progress.sent} / {progress.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? (progress.sent / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {sending ? (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/90 transition-all"
                >
                  <Ban size={16} /> Cancel
                </button>
              ) : (
                <button
                  onClick={openConfirm}
                  disabled={!subject.trim() || !body.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={16} /> Send
                </button>
              )}

              <button
                onClick={() => setShowTestModal(true)}
                disabled={!subject.trim() || !body.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-bold hover:bg-muted/60 transition-colors disabled:opacity-60"
              >
                <Mail size={13} /> Test send
              </button>
            </div>
          </div>
        </div>

        {/* Subscribers — right side */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Users size={15} className="text-primary" /> Subscribers
            </h2>
            <span className="text-[11px] font-bold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">{total}</span>
          </div>

          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="Add subscriber…"
              className="flex-1 min-w-0 px-3 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              disabled={adding || !addEmail.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-primary transition-all disabled:opacity-60 shrink-0"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
            </button>
          </form>

          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="Search emails…"
              className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="max-h-[300px] sm:max-h-[420px] overflow-y-auto space-y-0.5">
            {subscribers.map((s) => (
              <div key={s.email} className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{s.email}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                    {s.source} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.email)}
                  title={`Delete ${s.email}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {subscribers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No subscribers yet.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-xs text-primary hover:text-secondary disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-[10px] text-muted-foreground">
                Page {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-xs text-primary hover:text-secondary disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConfirm(false)}>
          <div className="bg-card rounded-xl border border-border shadow-2xl p-5 sm:p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-secondary mb-3">Confirm Send</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Subject:</span> {subject}</p>
              <p><span className="font-semibold">Recipients:</span> {confirmAudienceCount} subscriber(s)</p>
              <div className="bg-muted/40 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">{body}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button onClick={handleSend} className="px-4 py-2 text-sm font-bold rounded-lg bg-secondary text-secondary-foreground hover:bg-primary transition-all">
                Send now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test send modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowTestModal(false)}>
          <div className="bg-card rounded-xl border border-border shadow-2xl p-5 sm:p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-secondary mb-3">Test Send</h3>
            <p className="text-xs text-muted-foreground mb-3">Sends a test email with <code>[TEST]</code> prefix.</p>
            <textarea
              value={testEmails}
              onChange={(e) => setTestEmails(e.target.value)}
              placeholder="admin@example.com, team@example.com"
              rows={3}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-sm mb-3 focus:outline-none focus:border-primary/50"
            />
            {testFeedback && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3 ${
                testFeedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-destructive/5 border border-destructive/20 text-destructive"
              }`}>
                {testFeedback.type === "success" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                <span>{testFeedback.message}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTestModal(false)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/60">Cancel</button>
              <button
                onClick={handleTestSend}
                disabled={sendingTest || !testEmails.trim()}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-secondary text-secondary-foreground hover:bg-primary transition-all disabled:opacity-60"
              >
                {sendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
