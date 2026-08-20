"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Download, Plus, ChevronRight } from "lucide-react";
import { exportPeople, createPerson } from "@/actions/people";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PersonRow, PersonRole } from "@/types/cms";

function nameOf(p: PersonRow): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "—";
}

const allRoles: PersonRole[] = [
  "attendee",
  "donor",
  "applicant",
  "volunteer",
  "partner contact",
  "member",
  "admin",
];

const roleColors: Record<string, string> = {
  attendee: "bg-blue-50 text-blue-700",
  donor: "bg-rose-50 text-rose-700",
  applicant: "bg-indigo-50 text-indigo-700",
  volunteer: "bg-amber-50 text-amber-700",
  "partner contact": "bg-violet-50 text-violet-700",
  member: "bg-emerald-50 text-emerald-700",
  admin: "bg-muted text-secondary",
};

export default function PeopleTable({ initialData, canExport }: { initialData: PersonRow[]; canExport?: boolean }) {
  const router = useRouter();
  const [people, setPeople] = useState<PersonRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    roles: [] as PersonRole[],
  });
  const { toast } = useToast();

  function toggleRole(role: PersonRole) {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }));
  }

  async function handleCreate() {
    if (!form.firstName.trim()) { toast("First name is required", "error"); return; }
    setCreating(true);
    const result = await createPerson({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      roles: form.roles,
    });
    setCreating(false);
    if (result.error) { toast(result.error, "error"); return; }
    toast("Person created", "success");
    setShowCreate(false);
    setForm({ firstName: "", lastName: "", email: "", phone: "", notes: "", roles: [] });
    router.refresh();
  }

  const filtered = search
    ? people.filter(p =>
        (p.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.phone || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.roles || []).some(r => r.toLowerCase().includes(search.toLowerCase()))
      )
    : people;

  const handleExport = async () => {
    const rows = await exportPeople();
    const header = ["Name", "Email", "Phone", "Roles", "Records"];
    const lines = rows.map(p => {
      const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
      return [name, p.email, p.phone, (p.roles || []).join(", "), String(p.recordCount)]
        .map(v => `"${(v || "").replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bmac-people.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  function formatDate(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function openPerson(id: string) {
    router.push(`/admin/people/${id}`);
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">People</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Unified profiles across events, donations, and programs</p>
          </div>
        </div>
        {canExport && (
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary active:scale-[0.98] transition-all"
            >
              <Plus size={16} /> New Person
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-secondary text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        )}
      </div>

      <div className="relative w-full lg:max-w-xs">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, role..."
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        search ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
            <Users size={44} className="text-muted-foreground/20 mb-4" />
            <p className="text-sm font-medium text-secondary">No people match your search</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different term</p>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No people yet"
            description="Profiles appear here after a form submission, registration, or donation"
          />
        )
      ) : (
        <>
          <div className="lg:hidden space-y-2">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => openPerson(p.id)}
                className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-secondary truncate">{nameOf(p)}</p>
                    {p.recordCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground shrink-0">
                        {p.recordCount} {p.recordCount === 1 ? "record" : "records"}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {p.email && <span className="text-xs text-muted-foreground truncate">{p.email}</span>}
                    {(p.roles || []).length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {(p.roles || []).slice(0, 3).map(role => (
                          <span key={role} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColors[role] || "bg-muted text-muted-foreground"}`}>
                            {role}
                          </span>
                        ))}
                        {(p.roles || []).length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{(p.roles || []).length - 3}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Name</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Email</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Phone</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Roles</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Records</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => openPerson(p.id)}
                      className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-secondary transition-colors">{nameOf(p)}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{p.email || "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">{p.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(p.roles || []).length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                          {(p.roles || []).map(role => (
                            <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role] || "bg-muted text-muted-foreground"}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-muted text-xs font-semibold text-secondary">
                          {p.recordCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-xl border border-border p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-secondary">New Person</h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-colors text-lg leading-none">&times;</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">First name *</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Last name</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Roles</label>
              <div className="flex flex-wrap gap-1.5">
                {allRoles.map(role => (
                  <button key={role} type="button" onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.roles.includes(role)
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "border-border text-muted-foreground hover:text-secondary hover:border-primary/40"
                    }`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setShowCreate(false)} className="h-10 px-4 rounded-lg border border-border text-sm font-medium text-secondary hover:bg-muted/40 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating}
                className="h-10 px-5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary transition-all disabled:opacity-50">
                {creating ? "Creating…" : "Create Person"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
