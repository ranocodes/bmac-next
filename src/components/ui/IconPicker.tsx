"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Search, ChevronDown } from "lucide-react";

const RECOMMENDED = [
  "MicVocal", "BookOpen", "Monitor", "Users", "Scale", "Feather",
  "Zap", "Palette", "Code", "Globe", "GraduationCap", "Heart",
  "Lightbulb", "Music", "Camera", "Compass", "Award", "Star",
  "Rocket", "Target", "Brain", "PenTool", "Image", "LayoutDashboard",
];

function getAllIconNames(): string[] {
  const names = Object.keys(LucideIcons);
  const unique = names.filter(
    (n) =>
      /^[A-Z]/.test(n) &&
      !n.endsWith("Icon") &&
      !n.startsWith("Lucide") &&
      n !== "default" &&
      n !== "createReactComponent" &&
      n !== "createLucideIcon" &&
      !n.startsWith("__") &&
      n !== "Icon" &&
      n !== "DynamicIcon"
  );
  return [...new Set(unique)].sort();
}

const ALL_ICONS = getAllIconNames();

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setIsOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [isOpen]);

  const filtered = useMemo(
    () => (query ? ALL_ICONS.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 120) : []),
    [query]
  );

  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setQuery("");
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm transition-colors ${
          isOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-input"
        } ${value ? "text-secondary" : "text-muted-foreground/40"}`}
        aria-haspopup="listbox" aria-expanded={isOpen}
      >
        {SelectedIcon && (
          <span className="w-5 h-5 flex items-center justify-center text-primary shrink-0">
            <SelectedIcon size={18} />
          </span>
        )}
        <span className="flex-1 text-left">{value || "Select an icon..."}</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border/20">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 1,754 icons..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-input text-xs text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {!query ? (
              <>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                  Recommended
                </p>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                  {RECOMMENDED.map((name) => {
                    const Comp = (LucideIcons as any)[name];
                    if (!Comp) return null;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          onChange(name);
                          setIsOpen(false);
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-secondary transition-all ${
                          value === name ? "bg-primary/10 text-primary ring-1 ring-primary/30" : ""
                        }`}
                        title={name}
                      >
                        <Comp size={16} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground/50 text-center mt-3">Type to search all icons</p>
              </>
            ) : filtered.length > 0 ? (
              <>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                  {filtered.map((name) => {
                    const Comp = (LucideIcons as any)[name];
                    if (!Comp) return null;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          onChange(name);
                          setIsOpen(false);
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-secondary transition-all ${
                          value === name ? "bg-primary/10 text-primary ring-1 ring-primary/30" : ""
                        }`}
                        title={name}
                      >
                        <Comp size={16} />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">
                No icons matching &quot;{query}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
