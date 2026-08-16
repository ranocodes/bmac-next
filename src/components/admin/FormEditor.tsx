"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Save,
  Copy,
  Type,
  AlignLeft,
  List,
  Circle,
  CheckSquare,
  Calendar,
  Mail,
  Phone,
  Hash,
  FileText,
  Loader2,
  Pencil,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { FormQuestion, FormQuestionType } from "@/types/cms";

const TYPE_CONFIG: Record<FormQuestionType, { icon: any; label: string; color: string; preview: string }> = {
  text:     { icon: Type,        label: "Text",        color: "text-blue-500",    preview: "Short text answer" },
  textarea: { icon: AlignLeft,   label: "Paragraph",   color: "text-violet-500",  preview: "Longer text answer..." },
  select:   { icon: List,        label: "Dropdown",    color: "text-amber-500",   preview: "Select an option" },
  radio:    { icon: Circle,      label: "Single Choice", color: "text-emerald-500", preview: "Pick one" },
  checkbox: { icon: CheckSquare, label: "Multiple Choice", color: "text-cyan-500", preview: "Select all" },
  date:     { icon: Calendar,    label: "Date",        color: "text-rose-500",    preview: "mm/dd/yyyy" },
  email:    { icon: Mail,        label: "Email",       color: "text-indigo-500",  preview: "you@example.com" },
  phone:    { icon: Phone,       label: "Phone",       color: "text-teal-500",    preview: "+1 (555) 000-0000" },
  number:   { icon: Hash,        label: "Number",      color: "text-orange-500",  preview: "0" },
};

const ALL_TYPES: FormQuestionType[] = ["text", "textarea", "select", "radio", "checkbox", "date", "email", "phone", "number"];

interface FormEditorProps {
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
  onSave: () => void;
  saving: boolean;
  label?: string;
}

function QuestionCard({
  q,
  idx,
  total,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onMove,
  onDuplicate,
}: {
  q: FormQuestion;
  idx: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<FormQuestion>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
}) {
  const config = TYPE_CONFIG[q.type];
  const TypeIcon = config.icon;
  const needsOptions = q.type === "select" || q.type === "radio" || q.type === "checkbox";
  const isChoiceType = q.type === "text" || q.type === "textarea" || q.type === "email" || q.type === "phone" || q.type === "number";
  const [optionInput, setOptionInput] = useState((q.options || []).join(", "));

  return (
    <div className={`group rounded-xl border transition-all duration-200 ${expanded ? "border-primary/30 bg-card shadow-sm" : "border-border/60 bg-card/60 hover:border-border hover:bg-card"}`}>
      {/* Collapsed header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-0.5">
          <GripVertical size={14} className="text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors" />
          <span className="w-6 h-6 rounded-lg bg-primary/8 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
            {idx + 1}
          </span>
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${expanded ? "bg-primary/10" : "bg-muted/50"}`}>
          <TypeIcon size={14} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-secondary truncate">
            {q.label || <span className="text-muted-foreground/50 italic">Untitled question</span>}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{config.label} {q.required && "· Required"}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={() => onMove(-1)} disabled={idx === 0}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary hover:bg-muted/40 disabled:opacity-20 transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary hover:bg-muted/40 disabled:opacity-20 transition-colors">
            <ChevronDown size={14} />
          </button>
          <button onClick={onDuplicate}
            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
            <Copy size={13} />
          </button>
          <button onClick={onRemove}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
        <ChevronRight size={14} className={`text-muted-foreground/40 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/30 space-y-4" onClick={e => e.stopPropagation()}>
          {/* Type selector grid */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Field Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {ALL_TYPES.map(t => {
                const tc = TYPE_CONFIG[t];
                const TI = tc.icon;
                const active = q.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdate({ type: t, ...(active ? {} : { options: t === q.type ? q.options : [] }) })}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium transition-all
                      ${active
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-secondary"
                      }`}
                  >
                    <TI size={16} className={active ? tc.color : ""} />
                    {tc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Label</label>
            <input
              type="text"
              value={q.label}
              onChange={e => onUpdate({ label: e.target.value })}
              placeholder="e.g. What is your full name?"
              className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>

          {/* Placeholder + Required row */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            {isChoiceType && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Placeholder</label>
                <input
                  type="text"
                  value={q.placeholder || ""}
                  onChange={e => onUpdate({ placeholder: e.target.value })}
                  placeholder="Hint text for the user"
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            )}
            {!isChoiceType && <div />}
            <label className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={q.required}
                onChange={e => onUpdate({ required: e.target.checked })}
                className="rounded border-border accent-primary"
              />
              <span className="text-xs font-medium text-secondary">Required</span>
            </label>
          </div>

          {/* Options editor for choice types */}
          {needsOptions && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Options</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(q.options || []).map((opt, oi) => (
                  <span key={oi} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 text-primary text-xs font-medium">
                    {opt}
                    <button
                      type="button"
                      onClick={() => {
                        const next = (q.options || []).filter((_, i) => i !== oi);
                        onUpdate({ options: next });
                        setOptionInput(next.join(", "));
                      }}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={e => setOptionInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const parts = optionInput.split(",").map(s => s.trim()).filter(Boolean);
                      if (parts.length) {
                        const next = [...(q.options || []), ...parts.filter(p => !(q.options || []).includes(p))];
                        onUpdate({ options: next });
                        setOptionInput("");
                      }
                    }
                  }}
                  placeholder="Type an option and press Enter"
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-xs text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parts = optionInput.split(",").map(s => s.trim()).filter(Boolean);
                    if (parts.length) {
                      const next = [...(q.options || []), ...parts.filter(p => !(q.options || []).includes(p))];
                      onUpdate({ options: next });
                      setOptionInput("");
                    }
                  }}
                  className="h-9 px-3 rounded-lg border border-border bg-muted/30 text-xs font-medium text-secondary hover:bg-muted/60 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Live preview */}
          <div className="rounded-lg bg-muted/20 border border-border/40 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Preview</p>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-secondary">
                {q.label || "Question label"}
                {q.required && <span className="text-destructive ml-0.5">*</span>}
              </p>
              {q.type === "textarea" ? (
                <div className="h-16 rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground/40">
                  {q.placeholder || "Answer..."}
                </div>
              ) : q.type === "select" ? (
                <div className="h-9 rounded-md border border-border/50 bg-background/50 px-2.5 flex items-center justify-between text-xs text-muted-foreground/40">
                  <span>{q.placeholder || "Select..."}</span>
                  <ChevronDown size={12} />
                </div>
              ) : q.type === "radio" ? (
                <div className="space-y-1">
                  {(q.options || []).slice(0, 3).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-border/60" />
                      {opt}
                    </div>
                  ))}
                </div>
              ) : q.type === "checkbox" ? (
                <div className="space-y-1">
                  {(q.options || []).slice(0, 3).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <div className="w-3.5 h-3.5 rounded border-2 border-border/60" />
                      {opt}
                    </div>
                  ))}
                </div>
              ) : q.type === "date" ? (
                <div className="h-9 rounded-md border border-border/50 bg-background/50 px-2.5 flex items-center text-xs text-muted-foreground/40">
                  mm/dd/yyyy
                </div>
              ) : (
                <div className="h-9 rounded-md border border-border/50 bg-background/50 px-2.5 flex items-center text-xs text-muted-foreground/40">
                  {q.placeholder || TYPE_CONFIG[q.type].preview}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormEditor({ questions, onChange, onSave, saving, label }: FormEditorProps) {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function addQuestion() {
    const newQ: FormQuestion = {
      id: `q-${crypto.randomUUID()}`,
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      options: [],
      order: questions.length,
    };
    onChange([...questions, newQ]);
    setExpandedId(newQ.id);
  }

  function updateQuestion(id: string, patch: Partial<FormQuestion>) {
    onChange(questions.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function removeQuestion(id: string) {
    const next = questions.filter(q => q.id !== id).map((q, i) => ({ ...q, order: i }));
    onChange(next);
    if (expandedId === id) setExpandedId(null);
  }

  function duplicateQuestion(id: string) {
    const q = questions.find(q => q.id === id);
    if (!q) return;
    const dupe: FormQuestion = {
      ...q,
      id: `q-${crypto.randomUUID()}`,
      label: `${q.label} (copy)`,
      options: q.options ? [...q.options] : [],
      order: questions.length,
    };
    const idx = questions.findIndex(q => q.id === id);
    const next = [...questions];
    next.splice(idx + 1, 0, dupe);
    onChange(next.map((q, i) => ({ ...q, order: i })));
    setExpandedId(dupe.id);
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    const idx = questions.findIndex(q => q.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((q, i) => ({ ...q, order: i })));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {label && <p className="text-sm font-semibold text-secondary">{label}</p>}
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-border bg-card text-xs font-medium text-secondary hover:bg-muted/40 transition-colors"
          >
            <Plus size={14} /> Add Question
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
            <FileText size={24} className="text-primary/40" />
          </div>
          <p className="text-sm font-semibold text-secondary mb-1">No questions yet</p>
          <p className="text-xs text-muted-foreground mb-5 max-w-[240px]">Start building your form by adding questions one at a time</p>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              q={q}
              idx={idx}
              total={questions.length}
              expanded={expandedId === q.id}
              onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
              onUpdate={(patch) => updateQuestion(q.id, patch)}
              onRemove={() => removeQuestion(q.id)}
              onMove={(dir) => moveQuestion(q.id, dir)}
              onDuplicate={() => duplicateQuestion(q.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
