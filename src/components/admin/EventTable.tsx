"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { deleteItem } from "@/actions/crud";
import { useToast } from "@/components/ui/Toast";
import type { EventPass } from "@/types/cms";

interface EventRow extends Omit<EventPass, "date" | "desc"> {
  date: string;
  desc: string;
  isPaid: boolean;
}

export default function EventTable({ initialData }: { initialData: EventPass[] }) {
  const [events, setEvents] = useState<EventRow[]>([...initialData].reverse().map(e => ({
    ...e,
    date: e.date || (e as any).event_date || "",
    desc: e.desc || (e as any).description || "",
    isPaid: e.isPaid ?? (e as any).is_paid ?? false,
  })));
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this event?");
    if (!ok) return;
    await deleteItem("events", id);
    toast("Event deleted");
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const filtered = search
    ? events.filter((e: any) => e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
    : events;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Events</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage events</p>
          </div>
        </div>
        <Link href="/admin/events/new" className="flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Event</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
          <Calendar size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No events match your search" : "No events yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Create your first event to get started"}
          </p>
          {!search && (
            <Link href="/admin/events/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Event
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-2">
            {filtered.map((e: any) => (
              <div key={e.id} className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/events/${e.id}`} className="text-sm font-medium text-secondary truncate hover:text-primary transition-colors block">{e.title}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {e.date} &middot; {e.category} &middot; {e.isPaid ? `₦${e.price?.toLocaleString()}` : "Free"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/events/${e.id}/edit`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => handleDelete(e.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                    aria-label="Delete event">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Title</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">Category</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Date</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden lg:table-cell">Price</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e: any) => (
                    <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 truncate max-w-[200px]">
                        <div>
                          <Link href={`/admin/events/${e.id}`} className="font-medium text-secondary hover:text-primary transition-colors">
                            {e.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">{e.date} &middot; {e.category}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">{e.category}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{e.date}</td>
                      <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                        {e.isPaid ? `₦${e.price?.toLocaleString()}` : "Free"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/events/${e.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                            <Pencil size={14} />
                          </Link>
                          <button onClick={() => handleDelete(e.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                            aria-label="Delete event">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
