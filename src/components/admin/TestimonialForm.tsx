"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import { createItem, updateItem } from "@/actions/crud";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";

export default function TestimonialForm({ initialData }: { initialData?: any | null }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [name, setName] = useState(initialData?.name || "");
  const [designation, setDesignation] = useState(initialData?.designation || "");
  const [quote, setQuote] = useState(initialData?.quote || "");
  const [src, setSrc] = useState(initialData?.src || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { toast } = useToast();

  async function handleSubmit(publishStatus: "draft" | "published") {
    setError("");
    setMissingFields([]);

    if (!name || !quote) {
      const missing: string[] = [];
      if (!name) missing.push("name");
      if (!quote) missing.push("quote");
      setMissingFields(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);

    try {
      const payload = { name, designation, quote, src, status: publishStatus };
      if (isEdit && params?.id) {
        await updateItem("testimonials", params.id as string, payload);
      } else {
        const id = `testimonial-${Date.now()}`;
        await createItem("testimonials", { id, ...payload });
      }
      toast(isEdit ? "Testimonial updated" : "Testimonial created", "success");
      router.push("/admin/testimonials");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-40 bg-background border-b border-border/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 -mt-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/admin/testimonials"
            className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-muted-foreground hover:text-secondary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0 flex-nowrap overflow-x-auto">
            <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg border border-border/30 shrink-0">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all ${
                  status === "draft"
                    ? "bg-card text-secondary"
                    : "text-muted-foreground hover:text-secondary"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all ${
                  status === "published"
                    ? "bg-card text-secondary"
                    : "text-muted-foreground hover:text-secondary"
                }`}
              >
                Pub.
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="flex items-center justify-center gap-1 min-h-[36px] px-2.5 sm:px-3 py-1.5 bg-card border border-border text-secondary font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-[11px] sm:text-sm"
            >
              <Save className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save Draft"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={saving}
              className="flex items-center justify-center gap-1 min-h-[36px] px-2.5 sm:px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-[11px] sm:text-sm"
            >
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="truncate">{saving ? "Saving..." : isEdit ? "Update" : "Publish"}</span>
            </button>
          </div>
        </div>
      </div>

      <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-secondary mb-4 sm:mb-5">
        {isEdit ? "Edit Testimonial" : "New Testimonial"}
      </h1>

      <form className="space-y-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); handleSubmit(status); }}>
        <div className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                missingFields.includes("name") ? "border-destructive/50" : "border-border"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              placeholder="e.g. Debate Champion, Class of 2025"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Quote *</label>
            <textarea
              value={quote}
              onChange={e => setQuote(e.target.value)}
              rows={4}
              placeholder="Their testimonial..."
              className={`w-full px-3 py-2.5 min-h-[80px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none ${
                missingFields.includes("quote") ? "border-destructive/50" : "border-border"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Photo</label>
            <ImagePicker value={src} onChange={setSrc} previewShape="round" />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Required fields missing</p>
              <p className="text-destructive/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
