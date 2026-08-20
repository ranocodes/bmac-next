import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  actions,
}: {
  backHref?: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 mt-0.5 text-muted-foreground hover:text-secondary transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-secondary truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
