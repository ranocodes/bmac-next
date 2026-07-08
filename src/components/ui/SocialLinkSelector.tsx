"use client";

import { SOCIAL_PLATFORMS } from "@/lib/iconMapper";
import React from "react";
import { ChevronDown } from "lucide-react";

interface SocialLinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SocialLinkSelector({ value, onChange }: SocialLinkSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = SOCIAL_PLATFORMS.find(p => p.name === value);

  return (
    <div ref={ref} className="relative w-full sm:w-44">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 min-h-[40px] bg-muted/50 border border-input rounded-lg text-sm transition-colors">
        {selected ? (
          <>
            <selected.icon size={16} className="text-primary shrink-0" />
            <span className="text-secondary">{selected.name}</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 rounded border border-dashed border-muted-foreground/30 shrink-0" />
            <span className="text-muted-foreground/50">Select</span>
          </>
        )}
        <ChevronDown size={14} className="ml-auto text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {SOCIAL_PLATFORMS.map(p => (
              <button key={p.name} type="button" onClick={() => { onChange(p.name); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${value === p.name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"}`}>
                <p.icon size={16} className="shrink-0" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
