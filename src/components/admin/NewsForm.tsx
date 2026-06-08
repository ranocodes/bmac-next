"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getById, create, update, getAll, seedIfEmpty } from "@/data/store";
import type { NewsArticle, Category } from "@/types/cms";
import MarkdownEditor from "@/components/ui/MarkdownEditor";

export default function NewsForm() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const initialArticle = isEdit && params?.id
    ? getById<NewsArticle>("news", params.id as string)
    : null;

  const [title, setTitle] = useState(initialArticle?.title || "");
  const [date, setDate] = useState(initialArticle?.date || "");
  const [category, setCategory] = useState(initialArticle?.category || "");
  const [desc, setDesc] = useState(initialArticle?.desc || (initialArticle as any)?.description || "");
  const [content, setContent] = useState(initialArticle?.content || "");
  const [img, setImg] = useState(initialArticle?.img || "");
  const [status, setStatus] = useState<"draft" | "published">(initialArticle?.status || "draft");
  const [featured, setFeatured] = useState(initialArticle?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const defaultCategories = [
      "Achievements", "Programs", "Alumni", "Partnerships",
      "Events", "Announcements", "Workshops", "Competition",
      "Culture", "Mentorship", "Community",
    ];
    seedIfEmpty("categories", defaultCategories.map((name, i) => ({ id: `cat-${i}`, name })));
    const stored = getAll<Category>("categories");
    setCategories(stored.length > 0 ? stored : defaultCategories.map((name, i) => ({ id: `cat-${i}`, name })));
  }, []);

  function handleSubmit(publishStatus: "draft" | "published") {
    setError("");

    const stripped = content.replace(/<[^>]*>/g, "").trim();
    if (!title || !date || !category || !desc || !stripped) {
      setError("Title, date, category, description, and content are required");
      return;
    }

    setSaving(true);

    setTimeout(() => {
      const payload = {
        title, date, category, desc, content,
        img: img || "/images/placeholder.jpg",
        featured,
        status: publishStatus,
      };
      if (isEdit && params?.id) {
        update<NewsArticle>("news", params.id as string, payload);
      } else {
        create<NewsArticle>("news", { id: `news-${Date.now()}`, ...payload });
      }
      setSaving(false);
      router.push("/admin/news");
    }, 300);
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
            {isEdit ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-secondary mb-4 sm:mb-5">
        {isEdit ? "Edit Post" : "New Post"}
      </h1>

      <form className="space-y-4">
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Article title"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
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
              className="w-full px-3 py-2.5 min-h-[60px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
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
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={img}
                onChange={e => setImg(e.target.value)}
                placeholder="/images/placeholder.jpg"
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
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
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-background text-secondary/70 border border-input"
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
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
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
          <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
