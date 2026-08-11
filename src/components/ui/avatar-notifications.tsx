"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, CheckCheck, ArrowRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getNotifications, markNotificationsRead } from "@/actions/notifications"
import type { AdminNotification } from "@/lib/notifications"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()
}

export default function AvatarNotifications() {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<AdminNotification[]>([])
  const [unread, setUnread] = React.useState(0)
  const loadedRef = React.useRef(false)

  async function refresh() {
    try {
      const res = await getNotifications(20)
      setItems(res.items)
      setUnread(res.unread)
    } catch {
      // auth/network errors — ignore, retry next poll
    }
  }

  React.useEffect(() => {
    const initial = setTimeout(refresh, 0)
    const t = setInterval(refresh, 30_000)
    return () => {
      clearTimeout(initial)
      clearInterval(t)
    }
  }, [])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      if (!loadedRef.current) {
        loadedRef.current = true
        refresh()
      }
      if (unread > 0) {
        setUnread(0)
        setItems(prev => prev.map(i => ({ ...i, read: true })))
        markNotificationsRead().catch(() => {})
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-all hover:border-border hover:text-secondary hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-card">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="bottom" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="text-sm font-bold text-secondary">Notifications</span>
          {unread > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {unread} new
            </span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="space-y-1">
              {items.map(item => (
                <li key={item.id}>
                  <Link
                    href={item.link || "#"}
                    onClick={() => item.link && setOpen(false)}
                    aria-disabled={!item.link}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors",
                      item.read ? "opacity-70" : "bg-muted/40",
                      item.link ? "hover:border-border/50 hover:bg-muted/60" : "cursor-default"
                    )}
                  >
                    <Avatar className="mt-0.5 h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs font-semibold text-secondary">
                        {initials(item.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-secondary">{item.title}</p>
                      {item.message && (
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.message}</p>
                      )}
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                    {item.link && (
                      <div className="mt-1 shrink-0 text-muted-foreground/60">
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border/60 p-2">
            <button
              type="button"
              onClick={() => {
                setUnread(0)
                setItems(prev => prev.map(i => ({ ...i, read: true })))
                markNotificationsRead().catch(() => {})
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-border/50 hover:bg-muted/60 hover:text-secondary"
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
