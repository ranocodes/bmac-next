"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import ImagePicker from "@/components/ui/ImagePicker";
import CategorySelect from "@/components/ui/CategorySelect";
import { useToast } from "@/components/ui/Toast";
import { createItem, updateItem } from "@/actions/crud";

export default function NewsForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [desc, setDesc] = useState(initialData?.desc || initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [img, setImg] = useState(initialData?.img || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { toast } = useToast();

  async function handleSubmit(publishStatus: "draft" | "published") {
    setError("");
    setMissingFields([]);

    if (!title || !date || !category || !desc) {
      const missing: string[] = [];
      if (!title) missing.push("title");
      if (!date) missing.push("date");
      if (!category) missing.push("category");
      if (!desc) missing.push("description");
      setMissingFields(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title, date, category, description: desc, content,
        img: img || "/images/placeholder.jpg",
        featured,
        status: publishStatus,
      };
      if (isEdit && params?.id) {
        await updateItem("news_articles", params.id as string, payload);
      } else {
        await createItem("news_articles", payload);
      }
      toast(isEdit ? "Article updated" : "Article created", "success");
      router.push("/admin/news");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <Link
          href="/admin/news"
          className="flex items-center justify-center gap-2 min-h-[44px] px-3 text-sm text-muted-foreground hover:text-secondary transition-colors sm:justify-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </Link>
        <div className="flex flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 bg-card border border-border/50 text-secondary font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-xs sm:text-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs sm:text-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {isEdit ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-4 sm:mb-5">
        {isEdit ? "Edit Post" : "New Post"}
      </h1>

      <form className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Article title"
              className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                missingFields.includes("title") ? "border-destructive/50" : "border-border"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Description *
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Brief summary of the article"
              className={`w-full px-3 py-2.5 min-h-[60px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none ${
                missingFields.includes("description") ? "border-destructive/50" : "border-border"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                  missingFields.includes("date") ? "border-destructive/50" : "border-border"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Category *
              </label>
              <CategorySelect value={category} onChange={setCategory} error={missingFields.includes("category")} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Image
              </label>
              <ImagePicker value={img} onChange={setImg} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Status
              </label>
              <div className="flex gap-2">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium capitalize transition-colors ${
                      status === s
                        ? s === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-background text-secondary/70 border border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-sm text-secondary/80">Featured article</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">
            Content *
          </label>
          <MarkdownEditor value={content} onChange={setContent} placeholder="Full article content..." />
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
