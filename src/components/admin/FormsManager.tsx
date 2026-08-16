"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ClipboardList,
  Pencil,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getFormDefinition,
  upsertFormDefinition,
  deleteFormDefinition,
  getFormSubmissions,
} from "@/actions/forms";
import FormEditor from "@/components/admin/FormEditor";
import { useToast } from "@/components/ui/Toast";
import type { FormQuestion, FormDefinition } from "@/types/cms";

const FORM_TYPES = [
  { entityType: "volunteer", label: "Volunteer Application", desc: "Form for volunteer sign-ups" },
  { entityType: "partner", label: "Partner Application", desc: "Form for partnership inquiries" },
  { entityType: "donation", label: "Donation Form", desc: "Custom fields for donations" },
  { entityType: "contact", label: "Contact Form", desc: "Fields for the contact page" },
  { entityType: "newsletter", label: "Newsletter Signup", desc: "Extra fields for newsletter" },
  { entityType: "member", label: "Membership Application", desc: "Form for joining BMAC" },
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
                <div className="border-t border-border/50 p-5">
                  <FormEditor
                    questions={questions}
                    onChange={setQuestions}
                    onSave={handleSave}
                    saving={saving}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
