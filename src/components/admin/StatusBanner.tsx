import { AlertCircle, Clock, XCircle } from "lucide-react";

const VARIANTS = {
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-800",
    desc: "text-blue-700",
    Icon: AlertCircle,
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-800",
    desc: "text-amber-700",
    Icon: Clock,
  },
  closed: {
    bg: "bg-muted border-border",
    icon: "text-muted-foreground",
    title: "text-secondary",
    desc: "text-muted-foreground",
    Icon: XCircle,
  },
} as const;

export default function StatusBanner({
  title,
  description,
  variant = "closed",
}: {
  title: string;
  description: string;
  variant?: "info" | "warning" | "closed";
}) {
  const v = VARIANTS[variant];
  return (
    <div className={`rounded-xl border p-6 text-center ${v.bg}`}>
      <div className="flex justify-center mb-3">
        <v.Icon size={32} className={v.icon} />
      </div>
      <h3 className={`font-display text-lg font-bold ${v.title}`}>{title}</h3>
      <p className={`text-sm mt-2 leading-relaxed ${v.desc}`}>{description}</p>
    </div>
  );
}
