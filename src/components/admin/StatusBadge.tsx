const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  sent: "bg-emerald-50 text-emerald-700",
  active: "bg-emerald-50 text-emerald-700",
  resolved: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
  approved: "bg-emerald-50 text-emerald-700",
  enrolled: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  submitted: "bg-amber-50 text-amber-700",
  open: "bg-amber-50 text-amber-700",
  in_progress: "bg-amber-50 text-amber-700",
  awaiting: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  failed: "bg-red-50 text-red-700",
  closed: "bg-red-50 text-red-700",
  error: "bg-red-50 text-red-700",
  archived: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  withdrawn: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
};

function getStatusColor(status: string): string {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  if (STATUS_COLORS[key]) return STATUS_COLORS[key];
  for (const [pattern, color] of Object.entries(STATUS_COLORS)) {
    if (key.includes(pattern)) return color;
  }
  return "bg-muted text-muted-foreground";
}

export default function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const color = getStatusColor(status);
  const sizeClasses = size === "md" ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full uppercase tracking-wider ${sizeClasses} ${color}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
