"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getById, create, update, getAll, seedIfEmpty } from "@/data/store";
import type { NewsArticle, Category } from "@/types/cms";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function NewsForm() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");
  const [featured, setFeatured] = useState(false);
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
    if (isEdit && params?.id) {
      const article = getById<NewsArticle>("news", params.id as string);
      if (article) {
        setTitle(article.title);
        setDate(article.date);
        setCategory(article.category || "");
        setDesc(article.desc || (article as any).description || "");
        setContent(article.content);
        setImg(article.img || "");
        setFeatured(article.featured || false);
      }
    }
  }, [isEdit, params?.id]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const stripped = content.replace(/<[^>]*>/g, "").trim();
    if (!title || !date || !category || !desc || !stripped) {
      setError("Title, date, category, description, and content are required");
      return;
    }

    setSaving(true);

    // Simulate async
    setTimeout(() => {
      if (isEdit && params?.id) {
        update<NewsArticle>("news", params.id as string, {
          title, date, category, desc, content, img: img || "/images/placeholder.jpg", featured,
        });
      } else {
        create<NewsArticle>("news", {
          id: `news-${Date.now()}`,
          title, date, category, desc, content, img: img || "/images/placeholder.jpg", featured,
        });
      }
      setSaving(false);
      router.push("/admin/news");
    }, 300);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/news" className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-all">
          <ArrowLeft size={16} className="text-secondary" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">
            {isEdit ? "Edit Article" : "New Article"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? "Update article details" : "Create a new news article"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border/50 p-5 md:p-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title"
            className="w-full h-14 sm:h-11 px-5 sm:px-4 rounded-xl border border-input bg-background text-base sm:text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-14 sm:h-11 px-5 sm:px-4 rounded-xl border border-input bg-background text-base sm:text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full h-14 sm:h-11 px-5 sm:px-4 rounded-xl border border-input bg-background text-base sm:text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">Description (short summary)</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Brief summary of the article"
            className="w-full px-5 sm:px-4 py-4 sm:py-3 rounded-xl border border-input bg-background text-base sm:text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">Content</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Full article content..." />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">Image URL</label>
          <input type="text" value={img} onChange={e => setImg(e.target.value)} placeholder="/images/placeholder.jpg"
            className="w-full h-14 sm:h-11 px-5 sm:px-4 rounded-xl border border-input bg-background text-base sm:text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20" />
          <span className="text-sm font-medium text-secondary">Featured article</span>
        </label>

        {error && <p className="text-sm text-destructive bg-destructive/5 px-4 py-2.5 rounded-xl border border-destructive/10">{error}</p>}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center justify-center gap-2 h-12 sm:h-11 px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25 sm:shadow-none">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} />}
            {isEdit ? "Update Article" : "Create Article"}
          </button>
          <Link href="/admin/news"
            className="flex items-center justify-center gap-2 h-12 sm:h-11 px-6 rounded-2xl border-2 border-border text-sm font-medium text-secondary hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
