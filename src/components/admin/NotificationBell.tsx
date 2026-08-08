"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, HeartHandshake, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getNotifications, markNotificationsRead } from "@/actions/notifications";
import type { AdminNotification } from "@/lib/notifications";

function typeIcon(type: string) {
  if (type === "donation") return <HeartHandshake size={16} className="text-rose-500" />;
  if (type === "form_submission") return <UserPlus size={16} className="text-emerald-500" />;
  return <Bell size={16} className="text-primary" />;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const loadedRef = useRef(false);

  async function refresh() {
    try {
      const res = await getNotifications(20);
      setItems(res.items);
      setUnread(res.unread);
    } catch {
      // auth/network errors — ignore, retry next poll
    }
  }

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const t = setInterval(refresh, 30_000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !loadedRef.current) {
      loadedRef.current = true;
      refresh();
    }
    if (next && unread > 0) {
      setUnread(0);
      setItems(prev => prev.map(i => ({ ...i, read: true })));
      markNotificationsRead().catch(() => {});
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-all hover:border-border hover:text-secondary hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-card">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-xl border border-border/60 bg-card/95 p-2 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-bold text-secondary">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="max-h-96 space-y-1 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                ) : (
                  items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors ${
                        item.read ? "opacity-70" : "bg-muted/40"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{typeIcon(item.type)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-secondary">{item.title}</p>
                        {item.message && (
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {item.message}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                          {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setUnread(0);
                    setItems(prev => prev.map(i => ({ ...i, read: true })));
                    markNotificationsRead().catch(() => {});
                  }}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-border/50 hover:bg-muted/60 hover:text-secondary"
                >
                  <CheckCheck size={14} /> Mark all as read
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
