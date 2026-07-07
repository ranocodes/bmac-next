"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import { createItem, updateItem } from "@/actions/crud";
import type { Category } from "@/types/cms";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES: Category[] = [
  "Achievements", "Programs", "Alumni", "Partnerships",
  "Events", "Announcements", "Workshops", "Competition",
  "Culture", "Mentorship", "Community",
].map((name, i) => ({ id: `cat-${i}`, name }));

export default function GalleryForm({ initialData }: { initialData?: any | null }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [img, setImg] = useState(initialData?.img || "");
  const [alt, setAlt] = useState(initialData?.alt || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [categories] = useState<Category[]>(CATEGORIES);
  const { toast } = useToast();

  async function handleSubmit(publishStatus: "draft" | "published") {
    setError("");
    setMissingFields([]);

    if (!img || !alt || !category) {
      const missing: string[] = [];
      if (!img) missing.push("image");
      if (!alt) missing.push("alt text");
      if (!category) missing.push("category");
      setMissingFields(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);

    try {
      const payload = { img, alt, category, status: publishStatus };
      if (isEdit && params?.id) {
        await updateItem("gallery_items", params.id as string, payload);
      } else {
        const id = `gallery-${Date.now()}`;
        await createItem("gallery_items", { id, ...payload });
      }
      toast(isEdit ? "Gallery item updated" : "Gallery item created", "success");
      router.push("/admin/gallery");
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
            href="/admin/gallery"
            className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-muted-foreground hover:text-secondary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0 flex-wrap">
            <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg border border-border/30 shrink-0">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all ${
                  status === "draft"
                    ? "bg-background shadow-sm text-secondary"
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
                    ? "bg-background shadow-sm text-secondary"
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
              className="flex items-center justify-center gap-1 min-h-[36px] px-2.5 sm:px-3 py-1.5 bg-card border border-border/50 text-secondary font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-[11px] sm:text-sm"
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

      <h1 className="text-xl sm:text-2xl font-bold text-secondary mb-4 sm:mb-5">
        {isEdit ? "Edit Gallery Image" : "New Gallery Image"}
      </h1>

      <form className="space-y-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); handleSubmit(status); }}>
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Image *</label>
            <ImagePicker value={img} onChange={setImg} />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Alt Text *</label>
            <input
              type="text"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="BMAC Debate Championship"
              className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                missingFields.includes("alt text") ? "border-destructive/50" : "border-input"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                missingFields.includes("category") ? "border-destructive/50" : "border-input"
              }`}
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
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
