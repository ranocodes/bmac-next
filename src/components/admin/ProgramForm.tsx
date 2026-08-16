"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Check, CheckCircle2, Plus, X, Calendar, Timer, Users, AlertCircle, ChevronUp, ChevronDown, FileText, GripVertical } from "lucide-react";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import IconPicker from "@/components/ui/IconPicker";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";
import { createItem, updateItem } from "@/actions/crud";
import { getFormDefinition, upsertFormDefinition } from "@/actions/forms";
import type { ProgramInstructor } from "@/types/cms";
import type { FormQuestion, FormQuestionType } from "@/types/cms";

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
  const [longDesc, setLongDesc] = useState(initialData?.longDesc || initialData?.long_desc || "");
  const [img, setImg] = useState(initialData?.img || initialData?.img_url || "");
  const [icon, setIcon] = useState(initialData?.icon || initialData?.icon_name || "");
  const [color, setColor] = useState(initialData?.color || initialData?.color_class || "");
  const [variant, setVariant] = useState<"default" | "featured">(initialData?.variant || "default");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [landingPage, setLandingPage] = useState(initialData?.landing_page ?? initialData?.landingPage ?? false);
  const [landingPageError, setLandingPageError] = useState("");
  const [applicationsOpen, setApplicationsOpen] = useState(
    initialData?.applications_open ?? initialData?.applicationsOpen ?? false
  );
  const [isPaid, setIsPaid] = useState(initialData?.is_paid ?? initialData?.isPaid ?? false);
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [effort, setEffort] = useState(initialData?.effort || "");
  const [audienceFor, setAudienceFor] = useState<string[]>(initialData?.audienceFor || initialData?.audience_for || []);
  const [audienceForInput, setAudienceForInput] = useState("");
  const [audienceNotFor, setAudienceNotFor] = useState<string[]>(initialData?.audienceNotFor || initialData?.audience_not_for || []);
  const [audienceNotForInput, setAudienceNotForInput] = useState("");
  const [instructors, setInstructors] = useState<ProgramInstructor[]>(() => {
    if (initialData?.instructors?.length) return initialData.instructors;
    const name = initialData?.instructorName || initialData?.instructor_name || "";
    const bio = initialData?.instructorBio || initialData?.instructor_bio || "";
    const photo = initialData?.instructorPhoto || initialData?.instructor_photo || "";
    if (name || bio || photo) return [{ name, bio, photo }];
    return [];
  });
  const [curriculum, setCurriculum] = useState<{ title: string; outcome: string }[]>(initialData?.curriculum || []);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [curriculumTitle, setCurriculumTitle] = useState("");
  const [curriculumOutcome, setCurriculumOutcome] = useState("");
  const [includes, setIncludes] = useState<string[]>(initialData?.includes || []);
  const [includesInput, setIncludesInput] = useState("");
  const [refundPolicy, setRefundPolicy] = useState(initialData?.refundPolicy || initialData?.refund_policy || "");
  const [testimonials, setTestimonials] = useState<{ name: string; designation: string; quote: string }[]>(initialData?.testimonials || []);
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialDesignation, setTestimonialDesignation] = useState("");
  const [testimonialQuote, setTestimonialQuote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState(false);
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
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
  const [formLoaded, setFormLoaded] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  const QUESTION_TYPES: FormQuestionType[] = ["text", "textarea", "select", "radio", "checkbox", "date", "email", "phone", "number"];

  useEffect(() => {
    if (isEdit && params?.id && !formLoaded) {
      getFormDefinition("program", params.id as string).then((def) => {
        if (def) setFormQuestions(def.questions);
        setFormLoaded(true);
      });
    }
  }, [isEdit, params?.id, formLoaded]);

  function addQuestion() {
    const newQ: FormQuestion = {
      id: `q-${crypto.randomUUID()}`,
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      options: [],
      order: formQuestions.length,
    };
    setFormQuestions([...formQuestions, newQ]);
  }

  function updateQuestion(id: string, patch: Partial<FormQuestion>) {
    setFormQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }

  function removeQuestion(id: string) {
    setFormQuestions(prev => prev.filter(q => q.id !== id).map((q, i) => ({ ...q, order: i })));
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    setFormQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((q, i) => ({ ...q, order: i }));
    });
  }

  async function handleSaveForm() {
    if (!params?.id) return;
    setFormSaving(true);
    const sorted = formQuestions.map((q, i) => ({ ...q, order: i }));
    await upsertFormDefinition("program", params.id as string, sorted);
    setFormSaving(false);
    toast("Form saved", "success");
  }

  async function handleSubmit(publishStatus: "draft" | "published") {
    setError("");
    setSaveError(false);
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
      title,
      description: desc,
      long_desc: longDesc,
      img, icon, color,
      variant, status: publishStatus,
      landing_page: landingPage,
      applications_open: applicationsOpen,
      is_paid: isPaid,
      price: isPaid ? Math.max(0, Number(price) || 0) : 0,
      details: [detailDuration, detailSchedule, detailEligibility, ...detailOther].join(" | "),
      skills,
      faqs,
      duration,
      effort,
      audience_for: audienceFor,
      audience_not_for: audienceNotFor,
      instructor_name: instructors[0]?.name || "",
      instructor_bio: instructors[0]?.bio || "",
      instructor_photo: instructors[0]?.photo || "",
      instructors,
      curriculum,
      includes,
      refund_policy: refundPolicy,
      testimonials,
    };
    if (isEdit && params?.id) {
      try {
        await updateItem("programs", params.id as string, payload);
      } catch (err) {
        setSaving(false);
        setSaveError(true);
        setError(err instanceof Error ? err.message : "Could not save the program. Please try again.");
        return;
      }
    } else {
      try {
        await createItem("programs", payload);
      } catch (err) {
        setSaving(false);
        setSaveError(true);
        setError(err instanceof Error ? err.message : "Could not create the program. Please try again.");
        return;
      }
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
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isEdit ? "Update & Publish" : "Publish"}</span>
            </button>
          </div>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-4 sm:mb-5">
        {isEdit ? "Edit Program" : "New Program"}
      </h1>

      <form className="space-y-4">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Basic Info</p>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Program title"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Short Description *</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Brief summary of the program"
              className="w-full px-3 py-2.5 min-h-[60px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Visuals */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
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
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Content Sections</p>

          {/* Logistics Details */}
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-2">Logistics Details</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Duration</label>
                <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg">
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
                <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg">
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
                <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg">
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
                    <div key={i} className="flex items-center gap-2 px-3 py-2 min-h-[38px] bg-background border border-border rounded-lg">
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
                      className="flex-1 px-3 py-2 min-h-[38px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
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
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg">
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
                className="flex-1 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
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
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-background border border-border rounded-lg">
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
                  className="w-full px-3 py-2 min-h-[40px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <textarea
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  rows={2}
                  placeholder="Answer"
                  className="w-full px-3 py-2 min-h-[50px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
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

        {/* Detail Page Content */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/20">Detail Page Content</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12 weeks"
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Effort</label>
              <input
                type="text"
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                placeholder="2 hours per week"
                className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">This program is for</label>
              <div className="space-y-2 mb-2">
                {audienceFor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    <span className="flex-1 text-sm text-secondary">{item}</span>
                    <button
                      type="button"
                      onClick={() => setAudienceFor(audienceFor.filter((_, j) => j !== i))}
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
                  value={audienceForInput}
                  onChange={(e) => setAudienceForInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = audienceForInput.trim(); if (v) { setAudienceFor([...audienceFor, v]); setAudienceForInput(""); } } }}
                  placeholder="e.g. Teens ages 13-18"
                  className="flex-1 px-3 py-2 min-h-[38px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { const v = audienceForInput.trim(); if (v) { setAudienceFor([...audienceFor, v]); setAudienceForInput(""); } }}
                  className="w-full sm:w-auto px-3 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">This program is not for</label>
              <div className="space-y-2 mb-2">
                {audienceNotFor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg">
                    <X size={14} className="text-destructive shrink-0" />
                    <span className="flex-1 text-sm text-secondary">{item}</span>
                    <button
                      type="button"
                      onClick={() => setAudienceNotFor(audienceNotFor.filter((_, j) => j !== i))}
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
                  value={audienceNotForInput}
                  onChange={(e) => setAudienceNotForInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = audienceNotForInput.trim(); if (v) { setAudienceNotFor([...audienceNotFor, v]); setAudienceNotForInput(""); } } }}
                  placeholder="e.g. Advanced developers"
                  className="flex-1 px-3 py-2 min-h-[38px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { const v = audienceNotForInput.trim(); if (v) { setAudienceNotFor([...audienceNotFor, v]); setAudienceNotForInput(""); } }}
                  className="w-full sm:w-auto px-3 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Instructors</label>
            <div className="space-y-3">
              {instructors.length === 0 && (
                <p className="text-xs text-muted-foreground/50 py-2">No instructors added yet</p>
              )}
              {instructors.map((inst, i) => (
                <div key={i} className="bg-background border border-border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => { if (i > 0) { const next = [...instructors]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setInstructors(next); } }}
                          disabled={i === 0}
                          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-secondary disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (i < instructors.length - 1) { const next = [...instructors]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; setInstructors(next); } }}
                          disabled={i === instructors.length - 1}
                          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-secondary disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">Instructor {i + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInstructors(instructors.filter((_, j) => j !== i))}
                      className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={inst.name}
                        onChange={(e) => { const next = [...instructors]; next[i] = { ...next[i], name: e.target.value }; setInstructors(next); }}
                        placeholder="Instructor name"
                        className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Role</label>
                      <input
                        type="text"
                        value={inst.role || ""}
                        onChange={(e) => { const next = [...instructors]; next[i] = { ...next[i], role: e.target.value }; setInstructors(next); }}
                        placeholder="e.g. Lead Instructor"
                        className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Photo</label>
                    <ImagePicker 
                      value={inst.photo || ""} 
                      onChange={(val) => { const next = [...instructors]; next[i] = { ...next[i], photo: val }; setInstructors(next); }}
                      previewShape="round"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Bio</label>
                    <textarea
                      value={inst.bio}
                      onChange={(e) => { const next = [...instructors]; next[i] = { ...next[i], bio: e.target.value }; setInstructors(next); }}
                      rows={2}
                      placeholder="One or two sentences about the instructor"
                      className="w-full px-3 py-2.5 min-h-[50px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setInstructors([...instructors, { name: "", bio: "", photo: "", role: "" }])}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add Instructor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Curriculum</label>
            <div className="space-y-2 mb-2">
              {curriculum.length === 0 && (
                <p className="text-xs text-muted-foreground/50 py-2">No curriculum items yet</p>
              )}
              {curriculum.map((item, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-background border border-input rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.outcome}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurriculum(curriculum.filter((_, j) => j !== i))}
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors shrink-0 mt-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            {!curriculumOpen ? (
              <button
                type="button"
                onClick={() => setCurriculumOpen(true)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add module
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-background border border-border/50 rounded-lg">
                <input
                  type="text"
                  value={curriculumTitle}
                  onChange={(e) => setCurriculumTitle(e.target.value)}
                  placeholder="Module title"
                  className="w-full px-3 py-2 min-h-[40px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <textarea
                  value={curriculumOutcome}
                  onChange={(e) => setCurriculumOutcome(e.target.value)}
                  rows={2}
                  placeholder="What the learner can do after this module"
                  className="w-full px-3 py-2 min-h-[50px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!curriculumTitle.trim() || !curriculumOutcome.trim()) return;
                      setCurriculum([...curriculum, { title: curriculumTitle.trim(), outcome: curriculumOutcome.trim() }]);
                      setCurriculumTitle("");
                      setCurriculumOutcome("");
                      setCurriculumOpen(false);
                    }}
                    disabled={!curriculumTitle.trim() || !curriculumOutcome.trim()}
                    className="px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    Save module
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurriculumOpen(false); setCurriculumTitle(""); setCurriculumOutcome(""); }}
                    className="px-3 py-2 bg-card border border-border/50 text-secondary text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">What's included</label>
            <div className="space-y-2 mb-2">
              {includes.map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span className="flex-1 text-sm text-secondary">{item}</span>
                  <button
                    type="button"
                    onClick={() => setIncludes(includes.filter((_, j) => j !== i))}
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
                value={includesInput}
                onChange={(e) => setIncludesInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = includesInput.trim(); if (v) { setIncludes([...includes, v]); setIncludesInput(""); } } }}
                placeholder="e.g. Certification on completion"
                className="flex-1 px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => { const v = includesInput.trim(); if (v) { setIncludes([...includes, v]); setIncludesInput(""); } }}
                className="w-full sm:w-auto px-3 py-2.5 min-h-[44px] bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Refund policy</label>
            <textarea
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              rows={2}
              placeholder="Cancellation and refund policy"
              className="w-full px-3 py-2.5 min-h-[50px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Testimonials</label>
            <div className="space-y-2 mb-2">
              {testimonials.length === 0 && (
                <p className="text-xs text-muted-foreground/50 py-2">No testimonials yet</p>
              )}
              {testimonials.map((t, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-background border border-input rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.designation}</p>
                    <p className="text-xs text-secondary/80 mt-1 line-clamp-2">{t.quote}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors shrink-0 mt-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            {!testimonialOpen ? (
              <button
                type="button"
                onClick={() => setTestimonialOpen(true)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add testimonial
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-background border border-border/50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={testimonialName}
                    onChange={(e) => setTestimonialName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 min-h-[40px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                  />
                  <input
                    type="text"
                    value={testimonialDesignation}
                    onChange={(e) => setTestimonialDesignation(e.target.value)}
                    placeholder="Designation"
                    className="w-full px-3 py-2 min-h-[40px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>
                <textarea
                  value={testimonialQuote}
                  onChange={(e) => setTestimonialQuote(e.target.value)}
                  rows={3}
                  placeholder="Quote"
                  className="w-full px-3 py-2 min-h-[60px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!testimonialName.trim() || !testimonialQuote.trim()) return;
                      setTestimonials([...testimonials, { name: testimonialName.trim(), designation: testimonialDesignation.trim(), quote: testimonialQuote.trim() }]);
                      setTestimonialName("");
                      setTestimonialDesignation("");
                      setTestimonialQuote("");
                      setTestimonialOpen(false);
                    }}
                    disabled={!testimonialName.trim() || !testimonialQuote.trim()}
                    className="px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTestimonialOpen(false); setTestimonialName(""); setTestimonialDesignation(""); setTestimonialQuote(""); }}
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
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
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
                    : "bg-background border-border text-secondary/70"
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
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Applications</label>
              <button
                type="button"
                onClick={() => setApplicationsOpen(!applicationsOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg border transition-colors cursor-pointer ${
                  applicationsOpen
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background border-border text-secondary/70"
                }`}
              >
                <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                  applicationsOpen ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    applicationsOpen ? "translate-x-5" : "translate-x-1"
                  }`} />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {applicationsOpen ? "Open for Applications" : "Applications Closed"}
                  </span>
                  <span className="block text-[10px] mt-0.5 opacity-60 truncate">
                    {applicationsOpen
                      ? "Public registration form is live"
                      : "Public form shows 'Applications Closed'"}
                  </span>
                </div>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary/80 mb-1.5">Pricing</label>
              <button
                type="button"
                onClick={() => setIsPaid(!isPaid)}
                className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg border transition-colors cursor-pointer ${
                  isPaid
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background border-border text-secondary/70"
                }`}
              >
                <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                  isPaid ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    isPaid ? "translate-x-5" : "translate-x-1"
                  }`} />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {isPaid ? "Paid Program" : "Free Program"}
                  </span>
                  <span className="block text-[10px] mt-0.5 opacity-60 truncate">
                    {isPaid
                      ? "Applicants pay via Paystack on registration"
                      : "Toggle to charge a registration fee"}
                  </span>
                </div>
              </button>
              {isPaid && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">₦</span>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>
              )}
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
              <p className="font-medium">{saveError ? "Save failed" : "Required fields missing"}</p>
              <p className="text-destructive/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isEdit && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setFormExpanded(!formExpanded)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-primary" />
                <span className="text-sm font-semibold text-secondary">Application Form</span>
                {formQuestions.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                    {formQuestions.length} question{formQuestions.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${formExpanded ? "rotate-180" : ""}`} />
            </button>
            {formExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                {formQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText size={36} className="text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-secondary">No questions yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Add questions to build the application form</p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <Plus size={15} /> Add First Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-background border border-border rounded-lg p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="flex flex-col items-center gap-0.5 pt-1.5">
                            <GripVertical size={14} className="text-muted-foreground/30" />
                            <span className="text-[10px] font-bold text-muted-foreground/40">{idx + 1}</span>
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-2.5">
                            <select
                              value={q.type}
                              onChange={e => updateQuestion(q.id, { type: e.target.value as FormQuestionType })}
                              className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                            >
                              {QUESTION_TYPES.map(t => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={q.label}
                              onChange={e => updateQuestion(q.id, { label: e.target.value })}
                              placeholder="Question label"
                              className="h-9 px-3 rounded-lg border border-border bg-card text-xs text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                            />
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={q.required}
                                  onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                                  className="rounded border-border"
                                />
                                Req
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 pt-1">
                            <button
                              type="button"
                              onClick={() => moveQuestion(q.id, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded text-muted-foreground hover:text-secondary hover:bg-muted/40 disabled:opacity-30 transition-colors"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveQuestion(q.id, 1)}
                              disabled={idx === formQuestions.length - 1}
                              className="p-1 rounded text-muted-foreground hover:text-secondary hover:bg-muted/40 disabled:opacity-30 transition-colors"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        {(q.type === "select" || q.type === "radio" || q.type === "checkbox") && (
                          <div className="mt-2.5 ml-6">
                            <input
                              type="text"
                              value={(q.options || []).join(", ")}
                              onChange={e => updateQuestion(q.id, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                              placeholder="Options (comma-separated)"
                              className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                            />
                          </div>
                        )}
                        {(q.type === "text" || q.type === "textarea" || q.type === "email" || q.type === "phone" || q.type === "number") && (
                          <div className="mt-2.5 ml-6">
                            <input
                              type="text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(q.id, { placeholder: e.target.value })}
                              placeholder="Placeholder text"
                              className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border bg-card text-xs font-medium text-secondary hover:bg-muted/40 transition-colors"
                  >
                    <Plus size={13} /> Add Question
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    disabled={formSaving}
                    className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {formSaving ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : "Save Form"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
