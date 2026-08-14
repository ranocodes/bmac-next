"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Download } from "lucide-react";
import { exportPeople } from "@/actions/people";
import type { PersonRow } from "@/types/cms";

function nameOf(p: PersonRow): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "—";
}

const roleColors: Record<string, string> = {
  attendee: "bg-blue-500/10 text-blue-600",
  donor: "bg-rose-500/10 text-rose-600",
  applicant: "bg-indigo-500/10 text-indigo-600",
  volunteer: "bg-amber-500/10 text-amber-600",
  "partner contact": "bg-violet-500/10 text-violet-600",
  member: "bg-emerald-500/10 text-emerald-600",
  admin: "bg-secondary/10 text-secondary",
};

export default function PeopleTable({ initialData, canExport }: { initialData: PersonRow[]; canExport?: boolean }) {
  const router = useRouter();
  const [people] = useState<PersonRow[]>(initialData);
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primary shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">People</h1>
            <p className="text-sm text-muted-foreground mt-1">Unified profiles across events, donations, and programs</p>
          </div>
        </div>
        {canExport && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, role..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Users size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No people match your search" : "No people yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Profiles appear here after a form submission, registration, or donation"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Name</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Email</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden lg:table-cell">Phone</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4">Roles</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 hidden md:table-cell">Records</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden xl:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/admin/people/${p.id}`)}
                    className="cursor-pointer border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-secondary transition-colors">{nameOf(p)}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-muted-foreground text-xs">{p.email || "—"}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground text-xs">{p.phone || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(p.roles || []).length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                        {(p.roles || []).map(role => (
                          <span key={role} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${roleColors[role] || "bg-muted text-muted-foreground"}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right hidden md:table-cell">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-lg bg-muted text-xs font-semibold text-secondary">
                        {p.recordCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell text-muted-foreground text-xs whitespace-nowrap">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
