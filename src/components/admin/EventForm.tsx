"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import type { Category } from "@/types/cms";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { useToast } from "@/components/ui/Toast";
import { createItem, updateItem } from "@/actions/crud";

const DEFAULT_CATEGORIES: Category[] = [
  "Achievements", "Programs", "Alumni", "Partnerships",
  "Events", "Announcements", "Workshops", "Competition",
  "Culture", "Mentorship", "Community",
].map((name, i) => ({ id: `cat-${i}`, name }));

export default function EventForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState(initialData?.date || initialData?.event_date || "");
  const [time, setTime] = useState(initialData?.time || "");
  const [venue, setVenue] = useState(initialData?.venue || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [desc, setDesc] = useState(initialData?.desc || initialData?.description || "");
  const [longDesc, setLongDesc] = useState(initialData?.longDesc || initialData?.long_desc || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [isPaid, setIsPaid] = useState(initialData?.isPaid ?? initialData?.is_paid ?? false);
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [featureInput, setFeatureInput] = useState("");
  const [capacity, setCapacity] = useState(initialData?.capacity != null ? String(initialData.capacity) : "");
  const [registrationDeadline, setRegistrationDeadline] = useState(initialData?.registrationDeadline || initialData?.registration_deadline || "");
  const [maxPerPerson, setMaxPerPerson] = useState(initialData?.maxPerPerson ?? initialData?.max_per_person ?? 1);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(initialData?.allowPublicRegistration ?? initialData?.allow_public_registration ?? false);
  const [remindersEnabled, setRemindersEnabled] = useState(initialData?.remindersEnabled ?? initialData?.reminders_enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const { toast } = useToast();

  async function handleSubmit(publishStatus: "draft" | "published") {
    setError("");
    setSaveError(false);
    setMissingFields([]);

    if (!title || !desc || !longDesc || !date || !category) {
      const missing: string[] = [];
      if (!title) missing.push("title");
      if (!date) missing.push("date");
      if (!category) missing.push("category");
      if (!desc) missing.push("description");
      if (!longDesc) missing.push("details");
      setMissingFields(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);

    const payload = {
      title, date, time, venue, category,
      description: desc, long_desc: longDesc, features,
      is_paid: isPaid, price: isPaid ? Number(price) : 0,
      status: publishStatus,
      capacity: capacity ? Number(capacity) : 0,
      registration_deadline: registrationDeadline,
      max_per_person: maxPerPerson,
      allow_public_registration: allowPublicRegistration,
      reminders_enabled: remindersEnabled,
    };
    if (isEdit && params?.id) {
      try {
        await updateItem("events", params.id as string, payload);
      } catch (err) {
        setSaving(false);
        setSaveError(true);
        setError(err instanceof Error ? err.message : "Could not save the event. Please try again.");
        return;
      }
    } else {
      try {
        await createItem("events", payload);
      } catch (err) {
        setSaving(false);
        setSaveError(true);
        setError(err instanceof Error ? err.message : "Could not create the event. Please try again.");
        return;
      }
    }
    setSaving(false);
    toast(isEdit ? "Event updated" : "Event created", "success");
    router.push("/admin/events");
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <Link
          href="/admin/events"
          className="flex items-center justify-center gap-2 min-h-[44px] px-3 text-sm text-muted-foreground hover:text-secondary transition-colors sm:justify-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
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
        {isEdit ? "Edit Event" : "New Event"}
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
              placeholder="Event title"
              className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                missingFields.includes("title") ? "border-destructive/50" : "border-border"
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
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="Event location"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
                  missingFields.includes("category") ? "border-destructive/50" : "border-border"
                }`}
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Price
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px] px-3 bg-background border border-border rounded-lg">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={e => setIsPaid(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-secondary/80">Paid</span>
                </label>
                {isPaid && (
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                min={0}
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                placeholder="0 = unlimited"
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Registration deadline
              </label>
              <input
                type="date"
                value={registrationDeadline}
                onChange={e => setRegistrationDeadline(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">
                Max passes per person
              </label>
              <input
                type="number"
                min={1}
                value={maxPerPerson}
                onChange={e => setMaxPerPerson(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px] px-4 bg-background border border-border rounded-lg flex-1">
              <input
                type="checkbox"
                checked={allowPublicRegistration}
                onChange={e => setAllowPublicRegistration(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-secondary/80">Allow public registration</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px] px-4 bg-background border border-border rounded-lg flex-1">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={e => setRemindersEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-secondary/80">Send event reminders</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Features
            </label>
            <div className="space-y-2 mb-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg">
                  <span className="flex-1 text-sm text-secondary">{f}</span>
                  <button
                    type="button"
                    onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const val = featureInput.trim(); if (val) { setFeatures([...features, val]); setFeatureInput(""); } } }}
                placeholder="Add a feature..."
                className="flex-1 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => { const val = featureInput.trim(); if (val) { setFeatures([...features, val]); setFeatureInput(""); } }}
                className="px-4 py-2.5 min-h-[44px] bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Short Description *
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Brief summary of the event"
              className={`w-full px-3 py-2.5 min-h-[60px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none ${
                missingFields.includes("description") ? "border-destructive/50" : "border-border"
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">
            Details *
          </label>
          <MarkdownEditor value={longDesc} onChange={setLongDesc} placeholder="Full event details..." />
        </div>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{saveError ? "Save failed" : "Required fields missing"}</p>
              <p className="text-destructive/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
