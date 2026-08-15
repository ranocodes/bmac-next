import type { AdminRole, Permission } from "@/types/cms";

export const PERMISSION_LABELS: { key: Permission; label: string }[] = [
  { key: "manage_news", label: "Manage News" },
  { key: "manage_events", label: "Manage Events" },
  { key: "manage_programs", label: "Manage Programs" },
  { key: "manage_gallery", label: "Manage Gallery" },
  { key: "manage_team", label: "Manage Team" },
  { key: "manage_testimonials", label: "Manage Testimonials" },
  { key: "manage_categories", label: "Manage Categories" },
  { key: "manage_partners", label: "Manage Partners" },
  { key: "manage_stats", label: "Manage Stats" },
  { key: "manage_payments", label: "Manage Payments" },
  { key: "manage_people", label: "Manage People" },
  { key: "manage_logs", label: "Manage Activity Logs" },
  { key: "manage_users", label: "Manage Users & Admins" },
  { key: "access_settings", label: "Access Settings" },
  { key: "export_data", label: "Export Data" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "manage_workflows", label: "Manage Workflows & Inbox" },
  { key: "check_in_attendees", label: "Check In Attendees" },
  { key: "manage_newsletter", label: "Manage Newsletter" },
];

export const ALL_PERMISSION_KEYS: Permission[] = PERMISSION_LABELS.map((p) => p.key);

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ALL_PERMISSION_KEYS,
  administrator: [
    "manage_news", "manage_events", "manage_programs", "manage_gallery",
    "manage_team", "manage_testimonials", "manage_categories", "manage_partners",
    "manage_stats", "export_data", "view_analytics",
    "manage_workflows", "check_in_attendees", "manage_newsletter",
  ],
  moderator: [
    "manage_news", "manage_events", "manage_programs", "manage_gallery",
    "manage_team", "manage_testimonials", "manage_categories", "manage_stats",
    "manage_workflows",
  ],
};
