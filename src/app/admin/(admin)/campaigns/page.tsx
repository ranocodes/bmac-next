"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Send, Trash2, Loader2, Mail, Users, Clock, CheckCircle2, ArrowLeft, Eye, Code } from "lucide-react";
import { listCampaigns, getCampaign, saveCampaign, sendCampaign, deleteCampaign } from "@/actions/campaigns";
import type { EmailCampaign } from "@/actions/campaigns";
import { useToast } from "@/components/ui/Toast";

const AUDIENCES = [
  { key: "all", label: "All Subscribers" },
  { key: "members", label: "Members" },
  { key: "volunteers", label: "Volunteers" },
  { key: "applicants", label: "Applicants" },
] as const;

export default function CampaignsAdmin() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "edit" | "preview">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [textBody, setTextBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    const res = await listCampaigns();
    setCampaigns(res.campaigns || []);
    setLoading(false);
  }

  function startNew() {
    setEditingId(null);
    setTitle("");
    setSubject("");
    setHtmlBody("");
    setTextBody("");
    setTargetAudience("all");
    setView("edit");
  }

  async function handleSave() {
    if (!title.trim() || !subject.trim()) { toast("Title and subject required", "error"); return; }
    setSaving(true);
    const res = await saveCampaign({ id: editingId || undefined, title, subject, htmlBody, textBody, targetAudience });
    setSaving(false);
    if (res.error) { toast(res.error, "error"); return; }
    if (!editingId && res.id) setEditingId(res.id);
    toast(editingId ? "Campaign updated" : "Campaign saved as draft", "success");
    loadCampaigns();
  }

  async function handleSend(id: string) {
    setSendingCampaignId(id);
    const res = await sendCampaign(id);
    setSendingCampaignId(null);
    if (res.error) { toast(res.error, "error"); return; }
    toast(`Sent to ${res.sent} recipients`, "success");
    loadCampaigns();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await deleteCampaign(id);
    setDeletingId(null);
    if (res.error) { toast(res.error, "error"); return; }
    toast("Campaign deleted", "success");
    loadCampaigns();
  }

  function statusBadge(s: string) {
    if (s === "sent") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50"><CheckCircle2 size={10} /> Sent</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50"><Clock size={10} /> Draft</span>;
  }

  if (view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="font-display text-xl font-bold text-secondary">{editingId ? "Edit Campaign" : "New Campaign"}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Create and send email broadcasts to your audience.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Campaign Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. January Newsletter" className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject Line</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject" className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Audience</label>
            <div className="flex gap-2 flex-wrap">
              {AUDIENCES.map(a => (
                <button key={a.key} type="button" onClick={() => setTargetAudience(a.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${targetAudience === a.key ? "bg-primary text-card" : "bg-background border border-border text-secondary/70 hover:border-primary/30"}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Body (HTML)</label>
              <button type="button" onClick={() => setView("preview")} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><Eye size={12} /> Preview</button>
            </div>
            <textarea value={htmlBody} onChange={e => setHtmlBody(e.target.value)} rows={14} placeholder="<h1>Hello!</h1><p>Your email content here...</p>" className="w-full px-3 py-3 bg-background border border-border rounded-lg text-sm font-mono text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 resize-y" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Plain Text Fallback <span className="text-muted-foreground/60">(optional)</span></label>
            <textarea value={textBody} onChange={e => setTextBody(e.target.value)} rows={5} placeholder="Plain text version for email clients that don't support HTML" className="w-full px-3 py-3 bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 resize-y" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || sending} className="px-6 py-2.5 bg-muted text-secondary rounded-lg text-sm font-bold hover:bg-muted/80 transition-colors flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Draft
            </button>
            <button onClick={async () => { await handleSave(); if (editingId) await handleSend(editingId); }} disabled={saving || sending || !editingId} className="px-6 py-2.5 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "preview" && htmlBody) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("edit")} className="p-2 rounded-lg hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-xl font-bold text-secondary">Preview</h1>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Mail size={14} className="text-muted-foreground" />
            <span className="text-sm font-bold text-secondary">{subject || "No subject"}</span>
          </div>
          <iframe srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">${htmlBody}</body></html>`} className="w-full min-h-[500px] bg-white" sandbox="allow-same-origin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-secondary">Email Campaigns</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create and send email broadcasts.</p>
        </div>
        <button onClick={startNew} className="px-4 py-2.5 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : campaigns.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Mail size={40} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-bold text-secondary mb-1">No campaigns yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first email broadcast to reach your audience.</p>
          <button onClick={startNew} className="px-4 py-2 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <Plus size={14} /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-secondary text-sm truncate">{c.title}</p>
                  {statusBadge(c.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.subject}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={10} /> {AUDIENCES.find(a => a.key === c.target_audience)?.label || c.target_audience}</span>
                  {c.recipient_count > 0 && <span className="text-xs text-muted-foreground">{c.recipient_count} sent</span>}
                  {c.sent_at && <span className="text-xs text-muted-foreground">{new Date(c.sent_at).toLocaleDateString("en-NG")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {c.status === "draft" && (
                  <>
                    <button onClick={() => { setEditingId(c.id); setTitle(c.title); setSubject(c.subject); setHtmlBody(c.html_body); setTextBody(c.text_body || ""); setTargetAudience(c.target_audience); setView("edit"); }}
                      className="px-3 py-1.5 text-xs font-bold text-secondary bg-muted rounded-lg hover:bg-muted/80 transition-colors">Edit</button>
                    <button onClick={() => handleSend(c.id)} disabled={sendingCampaignId === c.id}
                      className="px-3 py-1.5 text-xs font-bold text-card bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-60">
                      {sendingCampaignId === c.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />} Send
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                  className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
