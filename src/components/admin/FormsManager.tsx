"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ClipboardList,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getFormDefinition,
  getFormDefinitionOrDefault,
  deleteFormDefinition,
  getFormSubmissions,
} from "@/actions/forms";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/admin/StatusBadge";
import type { FormDefinition } from "@/types/cms";

const FORM_TYPES = [
  { entityType: "partner", label: "Partner Application", desc: "Form for partnership inquiries" },
  { entityType: "volunteer", label: "Volunteer Application", desc: "Form for volunteer sign-ups" },
  { entityType: "member", label: "Membership Application", desc: "Form for joining BMAC" },
];

interface FormCard {
  entityType: string;
  entityId?: string;
  label: string;
  desc: string;
  definition: FormDefinition | null;
  submissionCount: number;
  loading: boolean;
}

export default function FormsManager() {
  const [cards, setCards] = useState<FormCard[]>(
    FORM_TYPES.map(ft => ({
      entityType: ft.entityType,
      label: ft.label,
      desc: ft.desc,
      definition: null,
      submissionCount: 0,
      loading: true,
    }))
  );
  const { toast, confirm } = useToast();

  useEffect(() => {
    FORM_TYPES.forEach(ft => {
      Promise.all([
        getFormDefinition(ft.entityType),
        getFormDefinitionOrDefault(ft.entityType),
        getFormSubmissions(ft.entityType),
      ]).then(([def, defaultDef, subs]) => {
        setCards(prev => prev.map(c =>
          c.entityType === ft.entityType
            ? { ...c, definition: def ?? defaultDef, submissionCount: subs.length, loading: false }
            : c
        ));
      });
    });
  }, []);

  async function handleDelete(entityType: string, entityId?: string) {
    const ok = await confirm("Delete this form definition? This cannot be undone.", { confirmText: "Delete" });
    if (!ok) return;
    await deleteFormDefinition(entityType, entityId);
    setCards(prev => prev.map(c =>
      c.entityType === entityType && c.entityId === entityId
        ? { ...c, definition: null, submissionCount: 0 }
        : c
    ));
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
        {cards.map((card) => {
          const hasForm = !!card.definition;
          const editHref = `/admin/forms/${card.entityType}`;

          return (
            <div key={`${card.entityType}-${card.entityId ?? "standalone"}`} className="bg-card rounded-xl border border-border">
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-secondary">{card.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                  </div>
                  {card.loading ? (
                    <Loader2 size={16} className="text-muted-foreground/40 animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <StatusBadge status={hasForm ? "active" : "inactive"} />
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
                  <Link
                    href={editHref}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-border bg-card text-secondary hover:bg-muted/40 transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </Link>
                  {hasForm && (
                    <button
                      onClick={() => handleDelete(card.entityType, card.entityId)}
                      disabled={false}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
