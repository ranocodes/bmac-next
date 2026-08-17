"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getFormDefinition,
  upsertFormDefinition,
  getFormSubmissions,
} from "@/actions/forms";
import FormEditor from "@/components/admin/FormEditor";
import { useToast } from "@/components/ui/Toast";
import type { FormQuestion } from "@/types/cms";

const FORM_LABELS: Record<string, string> = {
  volunteer: "Volunteer Application",
  partner: "Partner Application",
  donation: "Donation Form",
  contact: "Contact Form",
  newsletter: "Newsletter Signup",
  member: "Membership Application",
  program: "Program Application",
};

export default function FormEditPage() {
  const params = useParams();
  const router = useRouter();
  const entityType = params.entityType as string;
  const { toast } = useToast();

  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    Promise.all([
      getFormDefinition(entityType),
      getFormSubmissions(entityType),
    ]).then(([def, subs]) => {
      setQuestions(def?.questions ? def.questions.map(q => ({ ...q })) : []);
      setSubmissionCount(subs.length);
      setLoading(false);
    });
  }, [entityType]);

  async function handleSave() {
    setSaving(true);
    const sorted = questions.map((q, i) => ({ ...q, order: i }));
    await upsertFormDefinition(entityType, null, sorted);
    setSaving(false);
    toast("Form saved", "success");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <button
        onClick={() => router.push("/admin/forms")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Forms
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">
          {FORM_LABELS[entityType] || entityType}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {questions.length} question{questions.length !== 1 ? "s" : ""} · {submissionCount} submission{submissionCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <FormEditor
          questions={questions}
          onChange={setQuestions}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
}
