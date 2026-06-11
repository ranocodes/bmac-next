"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Check, CheckCircle2, Plus, X, Calendar, Timer, Users, AlertCircle } from "lucide-react";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import IconPicker from "@/components/ui/IconPicker";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";
import { createItem, updateItem } from "@/actions/crud";

const COLOR_OPTIONS = [
  { name: "Emerald", class: "text-emerald-400" },
  { name: "Blue", class: "text-blue-400" },
  { name: "Purple", class: "text-purple-400" },
  { name: "Amber", class: "text-amber-400" },
  { name: "Rose", class: "text-rose-400" },
  { name: "Cyan", class: "text-cyan-400" },
  { name: "Primary", class: "text-primary" },
  { name: "Accent", class: "text-accent" },
];

export default function ProgramForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [desc, setDesc] = useState(initialData?.desc || initialData?.description || "");
  const [longDesc, setLongDesc] = useState(initialData?.longDesc || "");
  const [img, setImg] = useState(initialData?.img || initialData?.img_url || "");
  const [icon, setIcon] = useState(initialData?.icon || initialData?.icon_name || "");
  const [color, setColor] = useState(initialData?.color || initialData?.color_class || "");
  const [variant, setVariant] = useState<"default" | "featured">(initialData?.variant || "default");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [landingPage, setLandingPage] = useState(initialData?.landingPage || false);
  const [landingPageError, setLandingPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { toast } = useToast();

  // Logistics details — predefined fields
  const detailsParts = (initialData?.details || "").split("|").map((s: string) => s.trim()).filter(Boolean);
  const [detailDuration, setDetailDuration] = useState(detailsParts[0] || "");
  const [detailSchedule, setDetailSchedule] = useState(detailsParts[1] || "");
  const [detailEligibility, setDetailEligibility] = useState(detailsParts[2] || "");
  const [detailOther, setDetailOther] = useState<string[]>(detailsParts.slice(3));
  const [detailOtherInput, setDetailOtherInput] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  // FAQs
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(initialData?.faqs || []);
  const [faqOpen, setFaqOpen] = useState(false);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  async function handleSubmit(publishStatus: "draft" | "published") {
    setError("");
    setMissingFields([]);

    if (!title || !desc || !longDesc) {
      const missing: string[] = [];
      if (!title) missing.push("title");
      if (!desc) missing.push("short description");
      if (!longDesc) missing.push("full description");
      setMissingFields(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);

    const payload = {
      title, desc, longDesc, img, icon, color,
      variant, status: publishStatus, landingPage,
      details: [detailDuration, detailSchedule, detailEligibility, ...detailOther].join(" | "),
      skills,
      faqs,
    };
    if (isEdit && params?.id) {
      await updateItem("programs", params.id as string, payload);
    } else {
      await createItem("programs", payload);
    }
    setSaving(false);
    toast(isEdit ? "Program updated" : "Program created", "success");
    router.push("/admin/programs");
  }

  function addSkill() {
    const val = skillInput.trim();
    if (!val) return;
    setSkills([...skills, val]);
    setSkillInput("");
  }

  function addFaq() {
    if (!faqQ.trim() || !faqA.trim()) return;
    setFaqs([...faqs, { q: faqQ.trim(), a: faqA.trim() }]);
    setFaqQ("");
    setFaqA("");
    setFaqOpen(false);
  }

  function handleLandingPageToggle() {
    setLandingPage(!landingPage);
    setLandingPageError("");
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-40 bg-background border-b border-border/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 -mt-2">

        <div className="flex items-center justify-between gap-2">

          <Link
            href="/admin/programs"
            className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-muted-foreground hover:text-secondary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex items-center gap-2 flex-1 justify-end max-w-[280px] sm:max-w-none">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 bg-card border border-border/50 text-secondary font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{saving ? "Saving..." : "Save Draft"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={saving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <span className="truncate">{isEdit ? "Update & Publish" : "Publish"}</span>
            </button>
          </div>
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-secondary mb-4 sm:mb-5">
        {isEdit ? "Edit Program" : "New Program"}
      </h1>

      <form className="space-y-4">
        {/* Basic Info */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Basic Info</p>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Program title"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Short Description *</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Brief summary of the program"
              className="w-full px-3 py-2.5 min-h-[60px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Visuals */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Visuals</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Icon</label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Color Accent</label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.class}
                    type="button"
                    onClick={() => setColor(c.class)}
                    className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${c.class}`}
                    style={{ background: "currentColor" }}
                    title={c.name}
                  >
                    {color === c.class && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                Used for the program icon on the public site
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Image</label>
            <ImagePicker value={img} onChange={setImg} />
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Content Sections</p>

          {/* Logistics Details */}
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-2">Logistics Details</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Duration</label>
                <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg">
                  <Timer size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={detailDuration}
                    onChange={(e) => setDetailDuration(e.target.value)}
                    placeholder="12 weeks"
                    className="flex-1 bg-transparent text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Schedule</label>
                <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg">
                  <Calendar size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={detailSchedule}
                    onChange={(e) => setDetailSchedule(e.target.value)}
                    placeholder="Saturdays 10am-12pm"
                    className="flex-1 bg-transparent text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Eligibility</label>
                <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg">
                  <Users size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={detailEligibility}
                    onChange={(e) => setDetailEligibility(e.target.value)}
                    placeholder="Open to ages 13-18"
                    className="flex-1 bg-transparent text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Other Details</label>
                <div className="space-y-1.5">
                  {detailOther.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 min-h-[38px] bg-background border border-input rounded-lg">
                      <span className="flex-1 text-sm text-secondary">{d}</span>
                      <button
                        type="button"
                        onClick={() => setDetailOther(detailOther.filter((_, j) => j !== i))}
                        className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    <input
                      type="text"
                      value={detailOtherInput}
                      onChange={(e) => setDetailOtherInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = detailOtherInput.trim(); if (v) { setDetailOther([...detailOther, v]); setDetailOtherInput(""); } } }}
                      placeholder="e.g. Venue: Jos Museum"
                      className="flex-1 px-3 py-2 min-h-[38px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => { const v = detailOtherInput.trim(); if (v) { setDetailOther([...detailOther, v]); setDetailOtherInput(""); } }}
                      className="w-full sm:w-auto px-3 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              What You'll Master
            </label>
            <div className="space-y-2 mb-2">
              {skills.length === 0 && (
                <p className="text-xs text-muted-foreground/50 py-2">No skills added yet</p>
              )}
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span className="flex-1 text-sm text-secondary">{s}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, j) => j !== i))}
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-1.5">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="e.g. Commanding presence and stage authority"
                className="flex-1 px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={addSkill}
                className="w-full sm:w-auto px-3 py-2.5 min-h-[44px] bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">
              Common Questions
            </label>
            <div className="space-y-2 mb-2">
              {faqs.length === 0 && (
                <p className="text-xs text-muted-foreground/50 py-2">No FAQs added yet</p>
              )}
              {faqs.map((faq, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-background border border-input rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary">{faq.q}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{faq.a}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors shrink-0 mt-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {!faqOpen ? (
              <button
                type="button"
                onClick={() => setFaqOpen(true)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add FAQ
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-background border border-border/50 rounded-lg">
                <input
                  type="text"
                  value={faqQ}
                  onChange={(e) => setFaqQ(e.target.value)}
                  placeholder="Question"
                  className="w-full px-3 py-2 min-h-[40px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <textarea
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  rows={2}
                  placeholder="Answer"
                  className="w-full px-3 py-2 min-h-[50px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addFaq}
                    disabled={!faqQ.trim() || !faqA.trim()}
                    className="px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    Save FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFaqOpen(false); setFaqQ(""); setFaqA(""); }}
                    className="px-3 py-2 bg-card border border-border/50 text-secondary text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Metadata</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Landing Page</label>
              <button
                type="button"
                onClick={handleLandingPageToggle}
                className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg border transition-colors cursor-pointer ${
                  landingPage
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background border-input text-secondary/70"
                }`}
              >
                <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                  landingPage ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    landingPage ? "translate-x-5" : "translate-x-1"
                  }`} />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {landingPage ? "Showing on Homepage" : "Hidden from Homepage"}
                  </span>
                  <span className="block text-[10px] mt-0.5 opacity-60 truncate">
                    {landingPage
                      ? "Appears in homepage workshop grid"
                      : "Toggle to feature on homepage"}
                  </span>
                </div>
              </button>
              {landingPageError && (
                <p className="text-[11px] text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {landingPageError}
                </p>
              )}
              {!landingPageError && (
                <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                  Max 3 programs shown on the homepage
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Status</label>
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
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Full Description *</label>
          <MarkdownEditor value={longDesc} onChange={setLongDesc} placeholder="Full program details..." />
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
