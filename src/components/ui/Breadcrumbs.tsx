"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({
  items,
  dark = false,
  className = "",
}: {
  items: Crumb[];
  dark?: boolean;
  className?: string;
}) {
  const linkClass = dark
    ? "text-white/60 hover:text-white font-semibold transition-colors"
    : "text-muted-foreground hover:text-secondary font-semibold transition-colors";
  const currentClass = dark ? "text-white font-bold" : "text-secondary font-bold";

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center flex-wrap gap-1.5 text-xs ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none m-0 p-0">
        <li>
          <Link href="/" className={linkClass}>
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className={dark ? "text-white/30" : "text-muted-foreground/50"} />
            {item.href ? (
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ) : (
              <span className={currentClass}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
