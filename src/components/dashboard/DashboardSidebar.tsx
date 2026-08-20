"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, Heart, Settings, LogOut } from "lucide-react";
import type { UserRoleInfo } from "@/lib/role-detect";

interface SidebarProps {
  userRole: UserRoleInfo;
}

export default function DashboardSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, show: true },
    { href: "/dashboard/member", label: "My Programs", icon: BookOpen, show: userRole.isMember },
    { href: "/dashboard/volunteer", label: "Volunteer", icon: Heart, show: userRole.isVolunteer },
  ];

  const roleBadgeColor = userRole.primaryRole === "combined"
    ? "bg-purple-100 text-purple-700"
    : userRole.primaryRole === "member"
    ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700";

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="bg-card rounded-xl border border-border p-4 sticky top-8">
        <div className="mb-6">
          <p className="font-display text-lg font-bold text-secondary">
            {userRole.firstName} {userRole.lastName}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {userRole.isMember && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                Member
              </span>
            )}
            {userRole.isVolunteer && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                Volunteer
              </span>
            )}
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.filter(item => item.show).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-secondary hover:bg-muted"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all"
          >
            <Settings size={18} />
            Account Settings
          </Link>
          <a
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all mt-1"
          >
            <LogOut size={18} />
            Sign Out
          </a>
        </div>
      </div>
    </aside>
  );
}
