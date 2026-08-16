"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ClipboardList,
  Save,
  X,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  getFormDefinition,
  upsertFormDefinition,
  deleteFormDefinition,
  getFormSubmissions,
} from "@/actions/forms";
import { useToast } from "@/components/ui/Toast";
import type { FormQuestion, FormQuestionType, FormDefinition, FormSubmission } from "@/types/cms";

const FORM_TYPES = [
  { entityType: "volunteer", label: "Volunteer Application", desc: "Form for volunteer sign-ups" },
  { entityType: "partner", label: "Partner Application", desc: "Form for partnership inquiries" },
  { entityType: "donation", label: "Donation Form", desc: "Custom fields for donations" },
  { entityType: "contact", label: "Contact Form", desc: "Fields for the contact page" },
  { entityType: "newsletter", label: "Newsletter Signup", desc: "Extra fields for newsletter" },
  { entityType: "member", label: "Membership Application", desc: "Form for joining BMAC" },
];

const QUESTION_TYPES: FormQuestionType[] = [
  "text", "textarea", "select", "radio", "checkbox", "date", "email", "phone", "number",
];

interface FormCard {
  entityType: string;
  definition: FormDefinition | null;
  submissionCount: number;
  loading: boolean;
}

export default function FormsManager() {
  const [cards, setCards] = useState<FormCard[]>(
    FORM_TYPES.map(ft => ({ entityType: ft.entityType, definition: null, submissionCount: 0, loading: true }))
  );
  const [editingType, setEditingType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast, confirm } = useToast();

  useEffect(() => {
    FORM_TYPES.forEach(ft => {
      Promise.all([
        getFormDefinition(ft.entityType),
        getFormSubmissions(ft.entityType),
      ]).then(([def, subs]) => {
        setCards(prev => prev.map(c =>
          c.entityType === ft.entityType
            ? { ...c, definition: def, submissionCount: subs.length, loading: false }
            : c
        ));
      });
    });
  }, []);

  function startEditing(entityType: string) {
    const card = cards.find(c => c.entityType === entityType);
    setQuestions(card?.definition?.questions ? [...card.definition.questions.map(q => ({ ...q }))] : []);
    setEditingType(entityType);
  }

  function cancelEditing() {
    setEditingType(null);
    setQuestions([]);
  }

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
    setQuestions([...questions, newQ]);
  }

  function updateQuestion(id: string, patch: Partial<FormQuestion>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function removeQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id).map((q, i) => ({ ...q, order: i })));
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((q, i) => ({ ...q, order: i }));
    });
  }

  async function handleSave() {
    if (!editingType) return;
    setSaving(true);
    const sorted = questions.map((q, i) => ({ ...q, order: i }));
    const def = await upsertFormDefinition(editingType, null, sorted);
    const subs = await getFormSubmissions(editingType);
    setCards(prev => prev.map(c =>
      c.entityType === editingType
        ? { ...c, definition: def, submissionCount: subs.length }
        : c
    ));
    setEditingType(null);
    setQuestions([]);
    setSaving(false);
    toast("Form saved", "success");
  }

  async function handleDelete(entityType: string) {
    const ok = await confirm("Delete this form definition? This cannot be undone.", { confirmText: "Delete" });
    if (!ok) return;
    await deleteFormDefinition(entityType);
    setCards(prev => prev.map(c =>
      c.entityType === entityType
        ? { ...c, definition: null, submissionCount: 0 }
        : c
    ));
    if (editingType === entityType) cancelEditing();
    toast("Form deleted", "success");
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <FileText size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Forms</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage standalone form definitions</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FORM_TYPES.map(ft => {
          const card = cards.find(c => c.entityType === ft.entityType)!;
          const isEditing = editingType === ft.entityType;
          const hasForm = !!card.definition;

          return (
            <div key={ft.entityType} className={`bg-card rounded-xl border transition-colors ${isEditing ? "border-primary/30" : "border-border"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-secondary">{ft.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{ft.desc}</p>
                  </div>
                  {card.loading ? (
                    <Loader2 size={16} className="text-muted-foreground/40 animate-spin shrink-0 mt-0.5" />
                  ) : hasForm ? (
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                      Active
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                      None
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {card.definition ? `${card.definition.questions.length} question${card.definition.questions.length !== 1 ? "s" : ""}` : "No form created"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList size={12} />
                    {card.submissionCount} submission{card.submissionCount !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => isEditing ? cancelEditing() : startEditing(ft.entityType)}
                    disabled={editingType !== null && !isEditing}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-border bg-card text-secondary hover:bg-muted/40 disabled:opacity-40 transition-colors"
                  >
                    {isEditing ? <><X size={13} /> Cancel</> : <><Pencil size={13} /> Edit</>}
                  </button>
                  {hasForm && (
                    <button
                      onClick={() => handleDelete(ft.entityType)}
                      disabled={editingType !== null}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-border/50 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {questions.length} question{questions.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addQuestion}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border bg-card text-xs font-medium text-secondary hover:bg-muted/40 transition-colors"
                      >
                        <Plus size={13} /> Add Question
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? "Saving..." : "Save Form"}
                      </button>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText size={36} className="text-muted-foreground/20 mb-3" />
                      <p className="text-xs font-medium text-secondary">No questions yet</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Add questions to build this form</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="bg-background rounded-xl border border-border p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-0.5 pt-1">
                              <GripVertical size={14} className="text-muted-foreground/30" />
                              <span className="text-[10px] font-bold text-muted-foreground/40">{idx + 1}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3">
                              <select
                                value={q.type}
                                onChange={e => updateQuestion(q.id, { type: e.target.value as FormQuestionType })}
                                className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              >
                                {QUESTION_TYPES.map(t => (
                                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={q.label}
                                onChange={e => updateQuestion(q.id, { label: e.target.value })}
                                placeholder="Question label"
                                className="h-9 px-3 rounded-lg border border-border bg-card text-xs text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={q.required}
                                    onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                                    className="rounded border-border"
                                  />
                                  Required
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 pt-0.5">
                              <button
                                onClick={() => moveQuestion(q.id, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted/40 disabled:opacity-30 transition-colors"
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() => moveQuestion(q.id, 1)}
                                disabled={idx === questions.length - 1}
                                className="p-1 rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted/40 disabled:opacity-30 transition-colors"
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                onClick={() => removeQuestion(q.id)}
                                className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete question"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {(q.type === "select" || q.type === "radio" || q.type === "checkbox") && (
                            <div className="mt-3 ml-7">
                              <input
                                type="text"
                                value={(q.options || []).join(", ")}
                                onChange={e => updateQuestion(q.id, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                placeholder="Options (comma-separated)"
                                className="w-full h-8 px-3 rounded-lg border border-border bg-card text-[11px] text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                          )}
                          {(q.type === "text" || q.type === "textarea" || q.type === "email" || q.type === "phone" || q.type === "number") && (
                            <div className="mt-3 ml-7">
                              <input
                                type="text"
                                value={q.placeholder || ""}
                                onChange={e => updateQuestion(q.id, { placeholder: e.target.value })}
                                placeholder="Placeholder text"
                                className="w-full h-8 px-3 rounded-lg border border-border bg-card text-[11px] text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
