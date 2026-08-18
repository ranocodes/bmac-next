"use client";

import { useEffect, useState } from "react";
import { Plus, X, Save, RotateCcw, User, Globe, FileText, Settings, BookOpen, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  saveSiteSettings,
  updateAdminProfile,
  getEmailTemplates,
  saveEmailTemplates,
  resetEmailTemplate,
} from "@/actions/settings";
import { useAdmin } from "@/lib/auth/admin-context";
import SocialLinkSelector from "@/components/ui/SocialLinkSelector";
import { useToast } from "@/components/ui/Toast";
import type { SiteSettings } from "@/types/cms";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_LABELS,
  type EmailTemplate,
} from "@/lib/email-templates";
import dynamic from "next/dynamic";

const EmailTemplateEditor = dynamic(() => import("@/components/ui/EmailTemplateEditor"), { ssr: false });

const DEFAULT = {
  logo_text: "BMAC",
  navigation: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ],
  social_links: [
    { name: "Instagram", href: "https://instagram.com/bmacjos", icon: "Instagram" },
    { name: "Twitter", href: "https://twitter.com/bmacjos", icon: "Twitter" },
  ],
  copyright: "Brilliant Minds Ambassadors Club. All rights reserved.",
  about_story: {
    eyebrow: "Our Story",
    heading: "From a Local Hub to a National Movement.",
    paragraphs: [
      "Brilliant Minds Ambassadors Club (BMAC) was founded in Jos, Plateau State by Suleiman Peace Jagaban — a visionary who saw the untapped potential in the youth around him.",
      "What began with five members meeting in a community hall has become a movement of over 350 trained young people. Our ambassadors are now winning regional championships and leading change across Nigeria.",
    ],
  },
  contact_info: {
    email: "hello@bmacjos.org",
    phone: "+234 803 456 7891",
    whatsapp: "2348034567891",
    address: "Nalado Street, Jos",
    hours: "Mon - Sat: 9am - 5pm",
  },
};

function inputCls() {
  return "w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors";
}

export default function SettingsForm({ initialData }: { initialData?: SiteSettings | null }) {
  const user = useAdmin();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [logoText, setLogoText] = useState(initialData?.logo_text || "BMAC");
  const [socialLinks, setSocialLinks] = useState<{ name: string; href: string; icon: string }[]>(
    initialData?.social_links || DEFAULT.social_links
  );
  const [copyright, setCopyright] = useState(initialData?.copyright || DEFAULT.copyright);
  const [aboutStory, setAboutStory] = useState<{ eyebrow: string; heading: string; paragraphs: string[] }>(
    initialData?.about_story && initialData.about_story.heading ? initialData.about_story : DEFAULT.about_story
  );
  const [contactInfo, setContactInfo] = useState<{ email: string; phone: string; whatsapp: string; address: string; hours: string }>(
    initialData?.contact_info && initialData.contact_info.email ? initialData.contact_info : DEFAULT.contact_info
  );
  const [navigation, setNavigation] = useState<{ name: string; href: string }[]>(
    initialData?.navigation || DEFAULT.navigation
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>(DEFAULT_EMAIL_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState(EMAIL_TEMPLATE_KEYS[0]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    getEmailTemplates()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  async function handleSaveProfile() {
    if (!user?.permissions.includes("access_settings")) {
      toast("You don't have permission to change settings", "error");
      return;
    }
    if (!firstName) { toast("Name is required", "error"); return; }
    setSavingProfile(true);
    const result = await updateAdminProfile(user.email, firstName);
    setSavingProfile(false);
    if (result?.error) { toast(result.error, "error"); return; }
    toast("Profile updated", "success");
  }

  async function handleSaveAll() {
    if (!user?.permissions.includes("access_settings")) { toast("Permission denied", "error"); return; }
    setSavingAll(true);
    try {
      await saveSiteSettings({
        logo_text: logoText,
        navigation,
        social_links: socialLinks,
        copyright,
        about_story: aboutStory,
        contact_info: contactInfo,
      });
      await saveEmailTemplates(templates);
      setIsDirty(false);
      toast("All settings saved", "success");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSavingAll(false);
    }
  }

  async function handleResetTemplate() {
    if (!user?.permissions.includes("access_settings")) { toast("Permission denied", "error"); return; }
    const res = await resetEmailTemplate(activeTemplate);
    if (res?.error) { toast(res.error, "error"); return; }
    const defaults = await getEmailTemplates();
    setTemplates(defaults);
    toast("Template reset to default", "success");
  }

  const active = templates[activeTemplate] || DEFAULT_EMAIL_TEMPLATES[activeTemplate];

  function patchActive(patch: Partial<EmailTemplate>) {
    setTemplates(prev => ({ ...prev, [activeTemplate]: { ...prev[activeTemplate], ...patch } }));
    setIsDirty(true);
  }

  return (
    <div className="w-full space-y-6">
      <div className="sticky top-0 z-40 bg-background border-b border-border/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 -mt-2">
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm text-muted-foreground hover:text-secondary transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={handleSaveAll}
              disabled={savingAll || !isDirty}
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {savingAll ? "Saving..." : "Save All Settings"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <Settings size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage site-wide settings and your profile</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/20">
          <User size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">Profile</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">Your display name shown in the dashboard header</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{firstName ? firstName.charAt(0).toUpperCase() : "?"}</span>
          </div>
          <div className="flex-1">
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your name"
              className={inputCls()} />
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm shrink-0">
            <Save className="w-3.5 h-3.5" />
            {savingProfile ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/20">
          <Globe size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">Site</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Logo Text</label>
          <input type="text" value={logoText} onChange={e => { setLogoText(e.target.value); setIsDirty(true); }} placeholder="BMAC"
            className={inputCls()} />
          <p className="text-xs text-muted-foreground/60 mt-1">Preview: <span className="font-display font-extrabold text-secondary">{logoText || "BMAC"}<span className="text-primary">.</span></span></p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-secondary/80">Social Links</label>
            <button type="button" onClick={() => { setSocialLinks([...socialLinks, { name: "", href: "", icon: "" }]); setIsDirty(true); }}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <Plus size={12} /> Add Social
            </button>
          </div>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-background border border-border/30 rounded-lg">
                <input type="text" value={link.name} onChange={e => {
                  const next = [...socialLinks]; next[i] = { ...next[i], name: e.target.value }; setSocialLinks(next); setIsDirty(true);
                }} placeholder="Instagram"
                  className="flex-1 px-3 py-2 min-h-[40px] bg-muted/50 border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors" />
                <input type="text" value={link.href} onChange={e => {
                  const next = [...socialLinks]; next[i] = { ...next[i], href: e.target.value }; setSocialLinks(next); setIsDirty(true);
                }} placeholder="https://..."
                  className="flex-[2] px-3 py-2 min-h-[40px] bg-muted/50 border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors" />
                <SocialLinkSelector value={link.icon} onChange={(v) => {
                  const next = [...socialLinks]; next[i] = { ...next[i], icon: v }; setSocialLinks(next); setIsDirty(true);
                }} />
                <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Copyright</label>
          <input type="text" value={copyright} onChange={e => { setCopyright(e.target.value); setIsDirty(true); }} placeholder="Brilliant Minds Ambassadors Club. All rights reserved."
            className={inputCls()} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/20">
          <BookOpen size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">About Story</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">The story section shown on the About page.</p>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Eyebrow</label>
          <input type="text" value={aboutStory.eyebrow} onChange={e => { setAboutStory(s => ({ ...s, eyebrow: e.target.value })); setIsDirty(true); }}
            className={inputCls()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Heading</label>
          <input type="text" value={aboutStory.heading} onChange={e => { setAboutStory(s => ({ ...s, heading: e.target.value })); setIsDirty(true); }}
            className={inputCls()} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-secondary/80">Paragraphs</label>
            <button type="button" onClick={() => { setAboutStory(s => ({ ...s, paragraphs: [...s.paragraphs, ""] })); setIsDirty(true); }}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <Plus size={12} /> Add Paragraph
            </button>
          </div>
          <div className="space-y-3">
            {aboutStory.paragraphs.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea
                  value={p}
                  onChange={e => { setAboutStory(s => ({ ...s, paragraphs: s.paragraphs.map((x, j) => j === i ? e.target.value : x) })); setIsDirty(true); }}
                  rows={3}
                  className="flex-1 px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <button type="button" onClick={() => setAboutStory(s => ({ ...s, paragraphs: s.paragraphs.filter((_, j) => j !== i) }))}
                  className="w-8 h-8 mt-1 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/20">
          <Phone size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">Contact Info</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">Shown in the footer and on the contact page.</p>
        {([
          ["email", "Email", "hello@bmacjos.org"],
          ["phone", "Phone / WhatsApp", "+234 803 456 7891"],
          ["whatsapp", "WhatsApp Number (digits only)", "2348034567891"],
          ["address", "Address / Hub", "Nalado Street, Jos"],
          ["hours", "Hours", "Mon - Sat: 9am - 5pm"],
        ] as const).map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">{label}</label>
            <input type="text" value={(contactInfo as Record<string, string>)[key]} onChange={e => { setContactInfo(s => ({ ...s, [key]: e.target.value })); setIsDirty(true); }} placeholder={placeholder}
              className={inputCls()} />
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/20">
          <FileText size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">Email Templates</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Edit subjects and bodies for automated emails. Placeholders like <code className="text-primary">{"{{formLink}}"}</code>,{" "}
          <code className="text-primary">{"{{firstName}}"}</code>, <code className="text-primary">{"{{amountLabel}}"}</code> are filled automatically.
        </p>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Template</label>
          <select
            value={activeTemplate}
            onChange={e => setActiveTemplate(e.target.value as (typeof EMAIL_TEMPLATE_KEYS)[number])}
            disabled={loadingTemplates}
            className={inputCls()}
          >
            {EMAIL_TEMPLATE_KEYS.map(key => (
              <option key={key} value={key}>{EMAIL_TEMPLATE_LABELS[key]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Subject</label>
          <input
            type="text"
            value={active?.subject || ""}
            onChange={e => patchActive({ subject: e.target.value })}
            className={inputCls()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Email Body</label>
          <EmailTemplateEditor
            value={active?.html || ""}
            onChange={html => patchActive({ html })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Plain Text Version</label>
          <p className="text-xs text-muted-foreground mb-1.5">Fallback for email clients that don't support HTML.</p>
          <textarea
            value={active?.text || ""}
            onChange={e => patchActive({ text: e.target.value })}
            rows={5}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-xs text-secondary font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleResetTemplate}
            title={`Reset ${EMAIL_TEMPLATE_LABELS[activeTemplate]} to default`}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-background text-secondary hover:bg-accent transition-colors disabled:opacity-50">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
