import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import ChartRegistry from "@/components/admin/charts/ChartRegistry";
import PageViewsLine from "@/components/admin/charts/PageViewsLine";
import ContentBreakdownBar from "@/components/admin/charts/ContentBreakdownBar";
import ActivityDonut from "@/components/admin/charts/ActivityDonut";
import TopPagesBar from "@/components/admin/charts/TopPagesBar";
import { getDailyViews, getTableCounts, getActivityBreakdown, getVisitorStats } from "@/actions/analytics";
import { BarChart3, Eye, Users, MousePointerClick, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Analytics - BMAC Admin" };

export default async function AnalyticsPage() {
  try {
    await requirePermission("view_analytics");
  } catch {
    return <PermissionDenied />;
  }

  const [dailyViews, tableCounts, activityBreakdown, visitorStats] = await Promise.all([
    getDailyViews().catch(() => [] as { date: string; count: number }[]),
    getTableCounts().catch(() => ({}) as Record<string, number>),
    getActivityBreakdown().catch(() => [] as { action: string; count: number }[]),
    getVisitorStats().catch(() => ({ totalViews: 0, uniqueVisitors: 0, todayViews: 0, topPages: [] })),
  ]);

  const contentData = [
    { label: "News", count: tableCounts.news_articles },
    { label: "Events", count: tableCounts.events },
    { label: "Programs", count: tableCounts.programs },
    { label: "Gallery", count: tableCounts.gallery_items },
    { label: "Team", count: tableCounts.team_members },
    { label: "Testimonials", count: tableCounts.testimonials },
  ];

  return (
    <ChartRegistry>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-primary shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Site traffic and content metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-1">
              <Eye size={18} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Views</span>
            </div>
            <p className="font-display text-3xl font-bold text-secondary">{visitorStats.totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-1">
              <Users size={18} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unique Visitors</span>
            </div>
            <p className="font-display text-3xl font-bold text-secondary">{visitorStats.uniqueVisitors.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-1">
              <MousePointerClick size={18} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</span>
            </div>
            <p className="font-display text-3xl font-bold text-secondary">{visitorStats.todayViews.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp size={18} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content Items</span>
            </div>
            <p className="font-display text-3xl font-bold text-secondary">
              {contentData.reduce((s, c) => s + c.count, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-display text-sm font-bold text-secondary mb-4">Page Views (30 days)</h3>
            <div className="h-[260px]">
              {dailyViews.length > 0 ? <PageViewsLine data={dailyViews} /> : <EmptyChart />}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-display text-sm font-bold text-secondary mb-4">Content Breakdown</h3>
            <div className="h-[260px]">
              {contentData.some(d => d.count > 0) ? <ContentBreakdownBar data={contentData} /> : <EmptyChart />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-display text-sm font-bold text-secondary mb-4">Activity by Type</h3>
            <div className="h-[280px] flex items-center justify-center">
              {activityBreakdown.length > 0 ? <ActivityDonut data={activityBreakdown} /> : <EmptyChart />}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-display text-sm font-bold text-secondary mb-4">Top Pages</h3>
            <div className="h-[260px]">
              {visitorStats.topPages.length > 0 ? <TopPagesBar data={visitorStats.topPages} /> : <EmptyChart />}
            </div>
          </div>
        </div>
      </div>
    </ChartRegistry>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <p className="text-sm text-muted-foreground">No data yet</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Start publishing content to see stats</p>
    </div>
  );
}

function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/5 border border-destructive/15 flex items-center justify-center mb-5">
        <span className="text-2xl font-bold text-destructive">!</span>
      </div>
      <h1 className="font-display text-xl font-bold text-secondary mb-2">Access Denied</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        You do not have permission to view analytics. Contact a super admin to grant you the
        &quot;View Analytics&quot; permission.
      </p>
    </div>
  );
}
