"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mail, Send, Search, Users, Loader2, CheckCircle2, AlertCircle,
  Download, Upload, Plus, Trash2, X, Clock, Eye, Smartphone, Monitor,
  Save, ChevronDown, ChevronUp, Calendar, AlertTriangle, Ban,
} from "lucide-react";
import {
  sendNewsletterBroadcast,
  sendNewsletterTest,
  listNewsletterSubscribers,
  addNewsletterSubscriber,
  deleteNewsletterSubscriber,
  exportNewsletterSubscribers,
  importNewsletterSubscribers,
  listNewsletterSources,
  saveNewsletterTemplate,
  deleteNewsletterTemplate,
  listNewsletterTemplates,
  scheduleNewsletterBroadcast,
  cancelNewsletterBroadcast,
  listBroadcastHistory,
} from "@/actions/newsletter-admin";
import type {
  NewsletterSubscriber,
  NewsletterSubscribersPage,
  Broadcast,
  NewsletterTemplate,
} from "@/actions/newsletter-admin";
import EmailPreview from "@/components/ui/EmailPreview";
import NewsletterHistory from "@/components/admin/NewsletterHistory";

const DRAFT_KEY = "bmac-newsletter-draft:v1";
const PAGE_SIZE = 50;

interface Feedback {
  type: "success" | "error";
  message: string;
}

export default function NewsletterClient({
  initialSubscribers,
  initialTotal,
  initialSources,
  initialBroadcasts,
  initialTemplates,
}: {
  initialSubscribers: NewsletterSubscriber[];
  initialTotal: number;
  initialSources: string[];
  initialBroadcasts: Broadcast[];
  initialTemplates: NewsletterTemplate[];
}) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [sourceFilter, setSourceFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sources, setSources] = useState<string[]>(initialSources);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(initialBroadcasts);
  const [templates, setTemplates] = useState<NewsletterTemplate[]>(initialTemplates);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [draftSaved, setDraftSaved] = useState<string | null>(null);

  const [composeFeedback, setComposeFeedback] = useState<Feedback | null>(null);
  const [listFeedback, setListFeedback] = useState<Feedback | null>(null);
  const [testFeedback, setTestFeedback] = useState<Feedback | null>(null);

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmails, setTestEmails] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAudienceCount, setConfirmAudienceCount] = useState(0);

  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = page + 1;

  const loadSubscribers = useCallback(async () => {
    try {
      const res = await listNewsletterSubscribers({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        source: sourceFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setSubscribers(res.rows);
      setTotal(res.total);
    } catch {
      setListFeedback({ type: "error", message: "Failed to load subscribers" });
    }
  }, [page, sourceFilter, debouncedSearch]);

  const loadHistory = useCallback(async () => {
    try {
      const rows = await listBroadcastHistory();
      setBroadcasts(rows);
    } catch { /* ignore */ }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const rows = await listNewsletterTemplates();
      setTemplates(rows);
    } catch { /* ignore */ }
  }, []);

  const loadSources = useCallback(async () => {
    try {
      const s = await listNewsletterSources();
      setSources(s);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  useEffect(() => { loadSubscribers(); }, [loadSubscribers]);

  useEffect(() => {
    if (!subject && !body) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ subject, body, savedAt: new Date().toISOString() }));
        const now = new Date();
        setDraftSaved(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
      } catch { /* quota */ }
    }, 800);
    return () => clearTimeout(timeout);
  }, [subject, body]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftSaved(null);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.subject || draft?.body) {
          setSubject(draft.subject || "");
          setBody(draft.body || "");
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setShowConfirm(false);
      setShowTestModal(false);
      setShowPreview(false);
      setShowTemplates(false);
    };
    const anyOpen = showConfirm || showTestModal || !showPreview || showTemplates;
    if (anyOpen) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [showConfirm, showTestModal, showPreview, showTemplates]);

  const filtered = useMemo(() => {
    if (!searchQuery && !sourceFilter) return subscribers;
    return subscribers;
  }, [subscribers, searchQuery, sourceFilter]);

  const toggleSelect = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.email)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} subscriber(s)?`)) return;
    let deleted = 0;
    for (const email of selected) {
      const res = await deleteNewsletterSubscriber(email);
      if (!res.error) deleted++;
    }
    setListFeedback({ type: "success", message: `Deleted ${deleted} subscriber(s)` });
    setSelected(new Set());
    loadSubscribers();
  };

  const handleBulkExport = async () => {
    const emails = selected.size > 0 ? Array.from(selected) : undefined;
    const res = await exportNewsletterSubscribers({
      source: sourceFilter || undefined,
      emails,
    });
    if (res.error || !res.csv) {
      setListFeedback({ type: "error", message: res.error || "Nothing to export" });
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

  const openConfirm = async () => {
    if (!subject.trim() || !body.trim()) {
      setComposeFeedback({ type: "error", message: "Subject and body required" });
      return;
    }
    try {
      const res = await listNewsletterSubscribers({ limit: 1, source: sourceFilter || undefined });
      setConfirmAudienceCount(res.total);
    } catch {
      setConfirmAudienceCount(0);
    }
    setShowConfirm(true);
  };

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setComposeFeedback(null);
    setProgress({ sent: 0, total: 0 });

    const controller = new AbortController();
    setAbortController(controller);

    const CHUNK_SIZE = 100;
    let offset = 0;
    let totalSent = 0;
    let totalErrors = 0;
    let totalCount = 0;
    let campaignId = "";
    let completed = false;

    try {
      while (!controller.signal.aborted) {
        const res = await sendNewsletterBroadcast({
          subject,
          body,
          offset,
          limit: CHUNK_SIZE,
          audienceSource: sourceFilter || undefined,
          campaignId: campaignId || undefined,
        });

        if (res.error) {
          setComposeFeedback({ type: "error", message: res.error });
          break;
        }

        campaignId = res.campaignId;
        totalCount = res.total;
        totalSent += res.sent;
        totalErrors += res.errors;
        setProgress({ sent: totalSent, total: totalCount });

        if (res.done) { completed = true; break; }
        offset += CHUNK_SIZE;
      }
    } catch (err) {
      if (controller.signal.aborted) {
        setComposeFeedback({ type: "success", message: `Aborted. Sent ${totalSent}/${totalCount}` });
      } else {
        setComposeFeedback({ type: "error", message: "Send failed unexpectedly" });
      }
    }

    setSending(false);
    setAbortController(null);
    setProgress(null);

    if (completed) {
      const msg = totalErrors > 0
        ? `Sent ${totalSent}/${totalCount} (${totalErrors} errors)`
        : `Sent ${totalSent} newsletter(s)`;
      setComposeFeedback({ type: "success", message: msg });
      setSubject("");
      setBody("");
      clearDraft();
    }

    loadSubscribers();
    loadHistory();
  };

  const handleTestSend = async () => {
    if (!testEmails.trim()) return;
    setSendingTest(true);
    setTestFeedback(null);
    const res = await sendNewsletterTest({ subject, body, to: testEmails });
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

  const handleSchedule = async () => {
    if (!scheduleTime || !subject.trim() || !body.trim()) {
      setComposeFeedback({ type: "error", message: "Subject, body, and schedule time required" });
      return;
    }
    const res = await scheduleNewsletterBroadcast({
      subject,
      body,
      scheduledFor: new Date(scheduleTime).toISOString(),
      audienceSource: sourceFilter || undefined,
    });
    if (res.error) {
      setComposeFeedback({ type: "error", message: res.error });
    } else {
      setComposeFeedback({ type: "success", message: `Scheduled for ${new Date(scheduleTime).toLocaleString()}` });
      setScheduleTime("");
    }
    loadHistory();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    const res = await addNewsletterSubscriber(addEmail);
    setAdding(false);
    if (res.error) {
      setListFeedback({ type: "error", message: res.error });
      return;
    }
    setAddEmail("");
    setListFeedback({ type: "success", message: `Added ${addEmail.trim().toLowerCase()}` });
    loadSubscribers();
    loadSources();
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Delete subscriber ${email}?`)) return;
    const res = await deleteNewsletterSubscriber(email);
    if (res.error) {
      setListFeedback({ type: "error", message: res.error });
      return;
    }
    setListFeedback({ type: "success", message: `Deleted ${email}` });
    loadSubscribers();
  };

  const handleExport = async () => {
    const res = await exportNewsletterSubscribers({ source: sourceFilter || undefined });
    if (res.error || !res.csv) {
      setListFeedback({ type: "error", message: res.error || "Nothing to export" });
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
    setListFeedback({
      type: "success",
      message: `Imported ${res.added} subscriber(s), ${res.skipped} duplicate(s), ${res.invalid} invalid.`,
    });
    loadSubscribers();
    loadSources();
  };

  const handleSaveTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      setShowSaveTemplate(true);
      return;
    }
    const res = await saveNewsletterTemplate({ name, subject, body });
    if (res.error) {
      setComposeFeedback({ type: "error", message: res.error });
    } else {
      setComposeFeedback({ type: "success", message: `Template "${name}" saved` });
      setTemplateName("");
      setShowSaveTemplate(false);
      loadTemplates();
    }
  };

  const handleDeleteTemplate = async (name: string) => {
    if (!window.confirm(`Delete template "${name}"?`)) return;
    await deleteNewsletterTemplate(name);
    loadTemplates();
  };

  const loadTemplate = (t: NewsletterTemplate) => {
    setSubject(t.subject);
    setBody(t.bodyMd);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <Mail size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Newsletter</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{total} active subscriber(s)</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted/60 transition-colors"
        >
          <Clock size={13} /> History
        </button>
      </div>

      {showHistory && (
        <NewsletterHistory
          broadcasts={broadcasts}
          onCancel={async (id) => {
            await cancelNewsletterBroadcast(id);
            loadHistory();
          }}
        />
      )}

      <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-semibold text-secondary flex items-center gap-2">
                <Send size={15} className="text-primary" /> Compose Broadcast
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {draftSaved && (
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">Draft saved {draftSaved}</span>
                )}
                {draftSaved && (
                  <button onClick={clearDraft} className="text-[10px] text-destructive hover:underline">Clear</button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-secondary/80">Audience</label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sourceFilter}
                  onChange={(e) => { setSourceFilter(e.target.value); setPage(0); }}
                  className="flex-1 min-w-0 px-3 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="">All subscribers</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-secondary transition-colors"
                >
                  <Eye size={13} /> {showPreview ? "Hide" : "Show"} preview
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
                className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Markdown body… (supports **bold**, *italic*, headings, lists, links)"
                rows={8}
                className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y sm:rows-12"
              />
            </div>

            {showPreview && (
              <div className="mt-4">
                <EmailPreview subject={subject} markdown={body} />
              </div>
            )}

            {composeFeedback && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mt-4 ${
                composeFeedback.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-destructive/5 border border-destructive/20 text-destructive"
              }`}>
                {composeFeedback.type === "success"
                  ? <CheckCircle2 size={16} className="shrink-0" />
                  : <AlertCircle size={16} className="shrink-0" />}
                <span>{composeFeedback.message}</span>
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
                  onClick={() => abortController?.abort()}
                  className="inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/90 transition-all"
                >
                  <Ban size={16} /> Abort
                </button>
              ) : (
                <button
                  onClick={openConfirm}
                  disabled={!subject.trim() || !body.trim()}
                  className="inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={16} /> Send
                </button>
              )}

              <button
                onClick={() => setShowTestModal(true)}
                disabled={!subject.trim() || !body.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 lg:py-2.5 border border-border rounded-lg text-xs font-bold hover:bg-muted/60 transition-colors disabled:opacity-60"
              >
                <Mail size={13} /> <span className="hidden sm:inline">Test send</span><span className="sm:hidden">Test</span>
              </button>

              <button
                onClick={handleSaveTemplate}
                disabled={!subject.trim() || !body.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 lg:py-2.5 border border-border rounded-lg text-xs font-bold hover:bg-muted/60 transition-colors disabled:opacity-60"
              >
                <Save size={13} /> <span className="hidden sm:inline">Save template</span><span className="sm:hidden">Save</span>
              </button>

              <button
                onClick={() => { setShowTemplates(!showTemplates); if (!showTemplates) loadTemplates(); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 lg:py-2.5 border border-border rounded-lg text-xs font-bold hover:bg-muted/60 transition-colors"
              >
                <ChevronDown size={13} /> <span className="hidden sm:inline">Templates ({templates.length})</span><span className="sm:hidden">({templates.length})</span>
              </button>
            </div>

            {showSaveTemplate && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name…"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTemplate(); if (e.key === "Escape") { setShowSaveTemplate(false); setTemplateName(""); } }}
                  className="flex-1 min-w-0 px-3 py-1.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                />
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-bold hover:bg-primary transition-all disabled:opacity-60"
                >
                  <Save size={12} /> Save
                </button>
                <button
                  onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }}
                  className="px-2 py-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {showTemplates && (
              <div className="mt-3 bg-muted/30 rounded-lg border border-border/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Saved templates</p>
                {templates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No templates saved yet.</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {templates.map((t) => (
                      <div key={t.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                        <button onClick={() => { loadTemplate(t); setShowTemplates(false); }} className="flex-1 text-left text-sm text-secondary truncate">
                          {t.name}
                        </button>
                        <span className="text-[10px] text-muted-foreground hidden group-hover:inline">
                          {t.subject ? `"${t.subject}"` : "no subject"}
                        </span>
                        <button
                          onClick={() => handleDeleteTemplate(t.name)}
                          title={`Delete "${t.name}"`}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Calendar size={13} className="text-muted-foreground" />
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleSchedule}
                disabled={!scheduleTime || !subject.trim() || !body.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-muted/60 transition-colors disabled:opacity-60"
              >
                <Clock size={12} /> Schedule
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Users size={15} className="text-primary" /> Subscribers
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">{filtered.length}</span>
              <button
                onClick={handleBulkExport}
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
              placeholder="Add subscriber…"
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
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
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
            {selected.size > 0 && (
              <>
                <span className="text-[10px] text-muted-foreground">{selected.size} selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:text-destructive/80 transition-colors"
                >
                  <Trash2 size={12} /> Delete selected
                </button>
              </>
            )}
          </div>
          {fileError && (
            <p className="text-xs text-destructive mb-3">{fileError}</p>
          )}

          {listFeedback && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3 ${
              listFeedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-destructive/5 border border-destructive/20 text-destructive"
            }`}>
              {listFeedback.type === "success" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              <span>{listFeedback.message}</span>
              <button onClick={() => setListFeedback(null)} className="ml-auto"><X size={12} /></button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selected.size === filtered.length}
              onChange={toggleSelectAll}
              className="rounded border-border"
            />
            <span className="text-[10px] text-muted-foreground">Select all</span>
          </div>

          <div className="max-h-[300px] sm:max-h-[420px] overflow-y-auto space-y-0.5">
            {filtered.map((s) => (
              <div key={s.email} className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={selected.has(s.email)}
                  onChange={() => toggleSelect(s.email)}
                  className="rounded border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{s.email}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                    {s.source} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {s.lastSentAt ? ` · sent ${new Date(s.lastSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
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
                Page {currentPage} / {totalPages}
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowConfirm(false)}>
          <div className="bg-card rounded-xl border border-border shadow-2xl p-5 sm:p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-secondary mb-3">Confirm Send</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Subject:</span> {subject}</p>
              <p><span className="font-semibold">Audience:</span> {confirmAudienceCount} subscriber(s){sourceFilter ? ` (${sourceFilter})` : ""}</p>
              <div className="bg-muted/40 rounded-lg p-3 max-h-48 overflow-y-auto">
                <EmailPreview subject={subject} markdown={body} />
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

      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowTestModal(false)}>
          <div className="bg-card rounded-xl border border-border shadow-2xl p-5 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-secondary mb-3">Test Send</h3>
            <p className="text-xs text-muted-foreground mb-3">Send a test email with <code>[TEST]</code> prefix in subject.</p>
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
