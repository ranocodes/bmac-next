"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Calendar, Heart, Users, Handshake, FileText, Mail, Phone, Shield, Briefcase, MessageSquare, Pencil, Trash2, KeyRound, Send } from "lucide-react";
import { updatePerson, deletePerson } from "@/actions/people";
import { sendPublicCredentials } from "@/actions/programs";
import { useToast } from "@/components/ui/Toast";
import type { Person, PersonRecord, PersonRecordKind, PersonRole } from "@/types/cms";

const roleColors: Record<string, string> = {
  attendee: "bg-blue-50 text-blue-700",
  donor: "bg-rose-50 text-rose-700",
  applicant: "bg-indigo-50 text-indigo-700",
  volunteer: "bg-amber-50 text-amber-700",
  "partner contact": "bg-violet-50 text-violet-700",
  member: "bg-emerald-50 text-emerald-700",
  admin: "bg-muted text-secondary",
};

const allRoles: PersonRole[] = [
  "attendee",
  "donor",
  "applicant",
  "volunteer",
  "partner contact",
  "member",
  "admin",
];

import type { LucideIcon } from "lucide-react";

const sectionConfig: { kind: PersonRecordKind; label: string; icon: LucideIcon; group: string }[] = [
  { kind: "event_registration", label: "Events", icon: Calendar, group: "Events" },
  { kind: "donation", label: "Donations", icon: Heart, group: "Donations" },
  { kind: "volunteer", label: "Volunteering", icon: Users, group: "Volunteering" },
  { kind: "member", label: "Membership", icon: Briefcase, group: "Applications" },
  { kind: "program", label: "Applications", icon: FileText, group: "Applications" },
  { kind: "partner", label: "Partnerships", icon: Handshake, group: "Partnerships" },
  { kind: "contact", label: "Contact", icon: MessageSquare, group: "Contact" },
  { kind: "admin", label: "Admin", icon: Shield, group: "Admin" },
];

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function initials(person: Person) {
  const parts = [person.firstName, person.lastName].filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function PersonDetail({ person, records, isAdmin }: { person: Person; records: PersonRecord[]; isAdmin: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const roles: PersonRole[] = isAdmin && !person.roles.includes("admin") ? [...person.roles, "admin"] : person.roles;
  const groups = sectionConfig
    .map(s => ({ ...s, items: records.filter(r => r.kind === s.kind) }))
    .filter(s => s.items.length > 0);

  const hasLoginEligibleRole = roles.some(r => r !== "admin");
  const hasLoginEligibleRecord = records.some(r =>
    ["member", "volunteer", "partner", "program", "event_registration", "donation"].includes(r.kind)
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [credentialsBanner, setCredentialsBanner] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
    roles: PersonRole[];
  }>({
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
    phone: person.phone,
    notes: person.notes,
    roles: roles,
  });

  function toggleRole(role: PersonRole) {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }));
  }

  async function handleSave() {
    if (!form.firstName.trim()) { toast("First name is required", "error"); return; }
    setSaving(true);
    const result = await updatePerson(person.id, form);
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    toast("Changes saved", "success");
    setEditing(false);
    router.refresh();
  }

  async function handleSendCredentials() {
    if (sendingCredentials) return;
    setSendingCredentials(true);
    const result = await sendPublicCredentials({ personId: person.id });
    setSendingCredentials(false);
    if (result.error) { toast(result.error, "error"); return; }
    setCredentialsBanner({ email: person.email, password: result.password || "" });
    toast("Login credentials sent", "success");
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const result = await deletePerson(person.id);
    setDeleting(false);
    if (result.error) { toast(result.error, "error"); setConfirmDelete(false); return; }
    toast("Person deleted", "success");
    router.push("/admin/people");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <Link href="/admin/people" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to People
        </Link>
        <div className="flex items-center gap-2">
          {(hasLoginEligibleRole || hasLoginEligibleRecord) && (
            <button onClick={handleSendCredentials} disabled={sendingCredentials || !person.email}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-sm font-medium text-secondary hover:bg-muted/40 transition-colors disabled:opacity-50">
              {sendingCredentials ? <Send size={14} className="animate-pulse" /> : <KeyRound size={14} />}
              {sendingCredentials ? "Sending…" : "Send Login"}
            </button>
          )}
          <button onClick={() => setEditing(v => !v)}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-sm font-medium text-secondary hover:bg-muted/40 transition-colors">
            <Pencil size={14} /> {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 ${
              confirmDelete ? "bg-destructive text-destructive-foreground border-destructive" : "border-destructive/40 text-destructive hover:bg-destructive/10"
            }`}>
            <Trash2 size={14} />
            {deleting ? "Deleting…" : confirmDelete ? "Confirm delete?" : "Delete"}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-display font-extrabold text-xl shrink-0">
            {initials(person)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-secondary">
              {[person.firstName, person.lastName].filter(Boolean).join(" ") || "Unnamed Person"}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-sm text-muted-foreground">
              {person.email && (
                <span className="flex items-center gap-2"><Mail size={14} /> {person.email}</span>
              )}
              {person.phone && (
                <span className="flex items-center gap-2"><Phone size={14} /> {person.phone}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <span key={role} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${roleColors[role] || "bg-muted text-muted-foreground"}`}>
                {role}
              </span>
            ))}
            {roles.length === 0 && <span className="text-xs text-muted-foreground">No role tags</span>}
          </div>
        </div>

        {editing && (
          <div className="mt-6 border-t border-border/50 pt-6 space-y-5">
            <h3 className="text-sm font-bold text-secondary">Edit profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">First name *</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Last name</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Roles</label>
              <div className="flex flex-wrap gap-1.5">
                {allRoles.map(role => (
                  <button key={role} type="button" onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.roles.includes(role)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-secondary hover:border-primary/40"
                    }`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(false)} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-secondary hover:bg-muted/40 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {credentialsBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-800">Login credentials sent to {credentialsBanner.email}</p>
          <p className="text-xs text-emerald-700">Password: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">{credentialsBanner.password}</code></p>
          <p className="text-xs text-emerald-600">Share this password securely. The user will be prompted to change it on first login.</p>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
          <Users size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">No records yet</p>
          <p className="text-xs text-muted-foreground mt-1">This person has no linked activity yet</p>
        </div>
      ) : (
        groups.map(g => (
          <div key={g.group + g.kind} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
              <g.icon size={16} className="text-primary" />
              <h2 className="font-display font-bold text-secondary">{g.label}</h2>
              <span className="ml-auto text-xs text-muted-foreground font-medium">{g.items.length} record{g.items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-border/20">
              {g.items.map(r => (
                <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary text-sm truncate">{r.refTitle || r.kind}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.refId && <span className="font-mono">{r.refId}</span>}
                      {r.refId && <span> · </span>}
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                    r.status === "completed" || r.status === "confirmed" || r.status === "received"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
