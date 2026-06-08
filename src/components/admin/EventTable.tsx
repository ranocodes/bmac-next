"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Plus, Pencil, Trash2, Search } from "lucide-react";
import { getAll, remove } from "@/data/store";
import { useToast } from "@/components/ui/Toast";
import type { EventPass } from "@/types/cms";

export default function EventTable() {
  const [events, setEvents] = useState<EventPass[]>([]);
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  function load() {
    const all = getAll<any>("events").map(e => ({
      ...e,
      date: e.date || e.event_date || "",
      desc: e.desc || e.description || "",
      isPaid: e.isPaid ?? e.is_paid ?? false,
    }));
    setEvents(all.reverse());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this event?");
    if (!ok) return;
    remove("events", id);
    toast("Event deleted");
    load();
  }

  const filtered = search
    ? events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
    : events;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage events</p>
        </div>
        <Link href="/admin/events/new" className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Event</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Calendar size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No events match your search" : "No events yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Create your first event to get started"}
          </p>
          {!search && (
            <Link href="/admin/events/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Event
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Title</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Category</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Date</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden lg:table-cell">Price</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-secondary">{e.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">{e.date} &middot; {e.category}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{e.category}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{e.date}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                      {e.isPaid ? `₦${e.price?.toLocaleString()}` : "Free"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/events/${e.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(e.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
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
      )}
    </div>
  );
}
