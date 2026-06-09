"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Newspaper, Calendar, BookOpen, Image, Users, Star, BarChart3, Settings, Tag, LogOut, Menu, ChevronRight, Send } from "lucide-react";
import { removeItem, getItem } from "@/data/store";
import { ToastProvider } from "@/components/ui/Toast";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Programs", href: "/admin/programs", icon: BookOpen },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Stats", href: "/admin/stats", icon: BarChart3 },
  { label: "Invite", href: "/admin/invite", icon: Send },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const session = getItem<{ email: string; firstName?: string }>("session");
    if (!session && pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    } else if (session) {
      setAuthed(true);
      setEmail(session.email);
      setFirstName(session.firstName || session.email.split("@")[0]);
    }
    setReady(true);
  }, [pathname]);

  const logout = useCallback(() => {
    removeItem("session");
    window.location.href = "/admin/login";
  }, []);

  const isLogin = pathname === "/admin/login";

  if (!ready) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (isLogin) return <ToastProvider><>{children}</></ToastProvider>;
  if (!authed) return null;

  return (
    <ToastProvider>
    <div className="min-h-[100dvh] bg-[#fafbf9] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border/50 flex flex-col transition-transform duration-300 w-[240px] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border/50">
          <div className="w-0.5 h-6 rounded-full bg-primary/40" />
          <span className="font-display font-extrabold text-lg text-secondary tracking-tight leading-none">BMAC<span className="text-primary">.</span></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 leading-none mt-0.5">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"}`}>
                <item.icon size={18} className={active ? "text-primary" : ""} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/50 p-3">
          <button onClick={logout} className="flex items-center gap-3 h-10 w-full px-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border/50 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted"><Menu size={20} /></button>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setProfileOpen(p => !p)} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <span className="text-xs font-bold text-primary">{firstName.charAt(0).toUpperCase()}</span>
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border/50 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                  <div className="px-4 py-2 border-b border-border/30">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium text-secondary truncate">{email}</p>
                  </div>
                  <button onClick={() => { setProfileOpen(false); logout(); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
          <span className="text-sm font-medium text-secondary hidden sm:block">{firstName}</span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
    </ToastProvider>
  );
}
