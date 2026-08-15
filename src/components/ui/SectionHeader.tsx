"use client";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  meta?: string;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  meta,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-secondary">
        {title}
      </h2>
      {meta && <p className="text-sm text-muted-foreground max-w-2xl">{meta}</p>}
    </div>
  );
}
