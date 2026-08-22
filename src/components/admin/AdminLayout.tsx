"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Newspaper, Calendar, BookOpen, Image, Users, Star,
  BarChart3, Settings, LogOut, Menu, ChevronRight,
  ChevronDown, Shield, Handshake, ClipboardList, PanelLeftClose, PanelLeftOpen,
  UserCog, ShieldOff, Inbox, QrCode, Heart, Mail, type LucideIcon,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import { AdminProvider } from "@/lib/auth/admin-context";
import type { Permission } from "@/types/cms";
import { logoutAdmin } from "@/actions/admin-auth";
import ProfileDropdown from "@/components/admin/ProfileDropdown";
import AvatarNotifications from "@/components/ui/avatar-notifications";

interface AdminUser {
  email: string;
  firstName: string;
  role: string;
  permissions: Permission[];
}

interface NavItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  permission?: Permission;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavItem[];
}

const defaultPermissions: Permission[] = [];

const navGroups: NavGroup[] = [
  {
    label: "Content", icon: Newspaper,
    children: [
      { label: "News", href: "/admin/news", icon: Newspaper, permission: "manage_news" },
      { label: "Events", href: "/admin/events", icon: Calendar, permission: "manage_events" },
      { label: "Programs", href: "/admin/programs", icon: BookOpen, permission: "manage_programs" },
      { label: "Gallery", href: "/admin/gallery", icon: Image, permission: "manage_gallery" },
      { label: "Team", href: "/admin/team", icon: Users, permission: "manage_team" },
      { label: "Testimonials", href: "/admin/testimonials", icon: Star, permission: "manage_testimonials" },
    ],
  },
  {
    label: "People", icon: Users,
    children: [
      { label: "Partners", href: "/admin/partners", icon: Handshake, permission: "manage_partners" },
      { label: "Admins", href: "/admin/admins", icon: UserCog, permission: "manage_users" },
    ],
  },
  {
    label: "Operations", icon: Inbox,
    children: [
      { label: "Check-In", href: "/admin/checkin", icon: QrCode, permission: "check_in_attendees" },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "view_analytics" },
      { label: "Stats", href: "/admin/stats", icon: BarChart3, permission: "manage_stats" },
      { label: "Donations & Payments", href: "/admin/donations", icon: Heart, permission: "manage_payments" },
    ],
  },
  {
    label: "System", icon: Shield,
    children: [
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail, permission: "manage_newsletter" },
      { label: "Settings", href: "/admin/settings", icon: Settings, permission: "access_settings" },
    ],
  },
];

function hasAccess(permissions: Permission[], item?: NavItem): boolean {
  if (!item?.permission) return true;
  return permissions.includes(item.permission);
}

function groupHasAccess(permissions: Permission[], group: NavGroup): boolean {
  return group.children.some(child => hasAccess(permissions, child));
}

const routePermissions: Record<string, Permission> = {
  "/admin/news": "manage_news",
  "/admin/events": "manage_events",
  "/admin/programs": "manage_programs",
  "/admin/gallery": "manage_gallery",
  "/admin/team": "manage_team",
  "/admin/testimonials": "manage_testimonials",
  "/admin/partners": "manage_partners",
  "/admin/stats": "manage_stats",
  "/admin/logs": "manage_logs",
  "/admin/payments": "manage_payments",
  "/admin/admins": "manage_users",
  "/admin/settings": "access_settings",
  "/admin/checkin": "check_in_attendees",
  "/admin/newsletter": "manage_newsletter",
  "/admin/donations": "manage_payments",
};

function checkRouteAccess(pathname: string, permissions: Permission[]): boolean {
  const exempt = ["/admin/login", "/admin"];
  if (exempt.includes(pathname)) return true;
  const matched = Object.entries(routePermissions).find(([route]) => pathname.startsWith(route));
  if (!matched) return true;
  return permissions.includes(matched[1]);
}

export default function AdminLayout({ children, user: userProp, error }: { children: React.ReactNode; user?: AdminUser; error?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const activeGroup = navGroups.find(g =>
      g.children.some(c => c.href && pathname.startsWith(c.href))
    );
    return activeGroup ? { [activeGroup.label]: true } : {};
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bmac_admin_sidebar_groups");
      if (saved) setOpenGroups(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("bmac_admin_sidebar_collapsed");
    if (saved !== "true") return;
    const id = setTimeout(() => setSidebarCollapsed(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    navGroups.forEach(g =>
      g.children.forEach(c => {
        if (c.href) router.prefetch(c.href);
      })
    );
  }, [router]);

  const user = userProp;
  const email = user?.email ?? "";
  const firstName = user?.firstName ?? "";
  const role = user?.role ?? "";
  const permissions = user?.permissions ?? defaultPermissions;

  const filteredGroups = navGroups
    .map(g => ({ ...g, children: g.children.filter(c => hasAccess(permissions, c)) }))
    .filter(g => groupHasAccess(permissions, g));

  const toggleGroup = (label: string) => {
    setOpenGroups(p => {
      const next = { ...p, [label]: !p[label] };
      localStorage.setItem("bmac_admin_sidebar_groups", JSON.stringify(next));
      return next;
    });
  };

  const denied = !checkRouteAccess(pathname, permissions);

  if (pathname === "/admin/login") {
    return <ToastProvider><>{children}</></ToastProvider>;
  }

  if (error) {
    return (
      <ToastProvider>
        <div className="min-h-[100dvh] bg-[#fafbf9] flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/5 flex items-center justify-center mx-auto mb-4">
              <ShieldOff size={32} className="text-destructive" />
            </div>
            <h2 className="font-display text-xl font-bold text-secondary">Authentication Error</h2>
            <p className="text-sm text-muted-foreground mt-3">{error}</p>
            <div className="mt-6">
              <button onClick={() => logoutAdmin()}
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
    <div className="min-h-[100dvh] bg-[#fafbf9] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border/50 flex flex-col transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className={`h-16 flex items-center gap-3 border-b border-border/50 shrink-0 ${sidebarCollapsed ? 'justify-center px-0' : 'px-5'}`}>
          <div className="w-0.5 h-6 rounded-full bg-primary/40 shrink-0" />
          {!sidebarCollapsed && (
            <>
              <span className="font-display font-extrabold text-lg text-secondary tracking-tight leading-none">BMAC<span className="text-primary">.</span></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 leading-none mt-0.5">Admin</span>
            </>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-2">
          <Link href="/admin" onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-center gap-3 h-10 rounded-xl text-sm font-medium transition-all ${sidebarCollapsed ? 'w-10 mx-auto' : 'px-3'} ${pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"}`}>
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
            {!sidebarCollapsed && pathname === "/admin" && <ChevronRight size={14} className="ml-auto text-primary" />}
          </Link>
          {filteredGroups.map(group => (
            <div key={group.label}>
              {sidebarCollapsed ? (
                <div className="relative group">
                  <button onClick={() => toggleGroup(group.label)}
                    className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                    <group.icon size={18} />
                  </button>
                  {openGroups[group.label] && (
                    <div className="absolute left-full top-0 ml-2 w-48 bg-card border border-border/50 rounded-xl shadow-lg z-50 py-2">
                      {group.children.map(child => (
                        <Link key={child.href} href={child.href!} onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 h-9 px-4 text-sm font-medium transition-all border-l-2 ${pathname === child.href ? "bg-primary/10 text-primary border-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted border-transparent"}`}>
                          {child.icon && <child.icon size={16} />}
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => toggleGroup(group.label)}
                    className="flex items-center gap-3 w-full h-10 px-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                    <group.icon size={18} />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${openGroups[group.label] ? "rotate-0" : "-rotate-90"}`} />
                  </button>
                  {openGroups[group.label] && (
                    <div className="ml-2 pl-3 border-l border-border/30 space-y-0.5 mt-0.5">
                      {group.children.map(child => (
                        <Link key={child.href} href={child.href!} onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 h-9 px-3 rounded-xl text-sm font-medium transition-all border-l-2 ${pathname === child.href ? "bg-primary/10 text-primary border-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted border-transparent"}`}>
                          {child.icon && <child.icon size={16} />}
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
        <div className={`border-t border-border/50 shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">{role.replace("_", " ")}</span>
            </div>
          )}
          <button onClick={() => logoutAdmin().catch(() => window.location.assign("/admin/login"))}
            className={`flex items-center justify-center gap-3 h-10 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all ${sidebarCollapsed ? 'w-10 mx-auto' : 'w-full px-3'}`}>
            <LogOut size={18} /> {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border/50 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted"><Menu size={20} /></button>
          <button onClick={() => setSidebarCollapsed(p => { const next = !p; localStorage.setItem("bmac_admin_sidebar_collapsed", String(next)); return next; })} className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <div className="flex-1" />
          <AvatarNotifications />
          <ProfileDropdown
            firstName={firstName}
            email={email}
            role={role}
            onLogout={() => logoutAdmin().catch(() => window.location.assign("/admin/login"))}
          />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {denied ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-destructive/5 flex items-center justify-center mb-4">
                <ShieldOff size={32} className="text-destructive" />
              </div>
              <h2 className="font-display text-xl font-bold text-secondary">Access Denied</h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                You don&apos;t have the required permissions to access this page.
              </p>
            </div>
          ) : <AdminProvider value={user ?? null}>{children}</AdminProvider>}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
