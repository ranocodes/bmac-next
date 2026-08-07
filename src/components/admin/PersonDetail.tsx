"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Heart, Users, Handshake, FileText, Mail, Phone, Shield, Briefcase, MessageSquare } from "lucide-react";
import type { Person, PersonRecord, PersonRecordKind } from "@/types/cms";

const roleColors: Record<string, string> = {
  attendee: "bg-blue-500/10 text-blue-600",
  donor: "bg-rose-500/10 text-rose-600",
  applicant: "bg-indigo-500/10 text-indigo-600",
  volunteer: "bg-amber-500/10 text-amber-600",
  "partner contact": "bg-violet-500/10 text-violet-600",
  member: "bg-emerald-500/10 text-emerald-600",
  admin: "bg-secondary/10 text-secondary",
};

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
  const roles = isAdmin && !person.roles.includes("admin") ? [...person.roles, "admin"] : person.roles;
  const groups = sectionConfig
    .map(s => ({ ...s, items: records.filter(r => r.kind === s.kind) }))
    .filter(s => s.items.length > 0);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <Link href="/admin/people" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Back to People
      </Link>

      <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8">
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
              <span key={role} className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${roleColors[role] || "bg-muted text-muted-foreground"}`}>
                {role}
              </span>
            ))}
            {roles.length === 0 && <span className="text-xs text-muted-foreground">No role tags</span>}
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Users size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">No records yet</p>
          <p className="text-xs text-muted-foreground mt-1">This person has no linked activity yet</p>
        </div>
      ) : (
        groups.map(g => (
          <div key={g.group + g.kind} className="bg-card rounded-3xl border border-border/50 overflow-hidden">
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
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium w-fit ${
                    r.status === "completed" || r.status === "confirmed" || r.status === "received"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-500"
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
