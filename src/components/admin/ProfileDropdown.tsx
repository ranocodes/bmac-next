"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, User, LogOut, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileDropdownProps {
  firstName: string;
  email: string;
  role?: string;
  onLogout: () => void;
}

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: User },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "View Site", href: "/", icon: Globe },
];

export default function ProfileDropdown({ firstName, email, role, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initial = firstName ? firstName.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(p => !p)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-3 border border-border/60 bg-card p-1.5 sm:p-2 sm:pl-3 transition-all duration-200 hover:border-border hover:bg-muted/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <div className="hidden sm:block flex-1 text-left">
          <div className="font-medium text-sm text-secondary leading-tight tracking-tight">
            {firstName || "Admin"}
          </div>
          <div className="max-w-[150px] truncate text-xs text-muted-foreground leading-tight tracking-tight">
            {email}
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/60 to-amber-400 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
              <span className="text-sm font-bold text-primary">{initial}</span>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-1.5rem)] origin-top-right border border-border/60 bg-card/95 p-2 shadow-xl backdrop-blur-sm"
            >
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="truncate text-sm font-medium leading-tight text-secondary">
                  {firstName || "Admin"}
                </p>
                <p className="truncate text-xs leading-tight text-muted-foreground">{email}</p>
                {role && (
                  <span className="mt-1.5 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {role.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {menuItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-border/50 hover:bg-muted/60"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-secondary" />
                    <span className="text-sm font-medium text-secondary">{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <button
                type="button"
                onClick={() => { setIsOpen(false); onLogout(); }}
                className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-destructive/10 p-3 transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/20"
              >
                <LogOut className="h-4 w-4 shrink-0 text-destructive group-hover:text-destructive" />
                <span className="text-sm font-medium text-destructive">Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
