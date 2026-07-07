"use client";

import { useEffect, useState } from "react";
import { Plus, X, Save, User, Globe } from "lucide-react";
import { saveSiteSettings, updateAdminProfile } from "@/actions/settings";
import { useAdmin } from "@/lib/auth/admin-context";
import SocialLinkSelector from "@/components/ui/SocialLinkSelector";
import { useToast } from "@/components/ui/Toast";

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
};

export default function SettingsForm({ initialData }: { initialData?: any | null }) {
  const user = useAdmin();
  const [firstName, setFirstName] = useState("");
  const [logoText, setLogoText] = useState("");
  const [socialLinks, setSocialLinks] = useState<{ name: string; href: string; icon: string }[]>([]);
  const [copyright, setCopyright] = useState("");
  const [savingSite, setSavingSite] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) setFirstName(user.firstName || "");
    const s = initialData || DEFAULT;
    setLogoText(s.logo_text || "BMAC");
    setSocialLinks(s.social_links || DEFAULT.social_links);
    setCopyright(s.copyright || DEFAULT.copyright);
  }, [initialData, user]);

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

  async function handleSaveSite() {
    if (!user?.permissions.includes("access_settings")) { toast("Permission denied", "error"); return; }
    setSavingSite(true);
    await saveSiteSettings({
      logo_text: logoText,
      navigation: DEFAULT.navigation,
      social_links: socialLinks,
      copyright,
    });
    setSavingSite(false);
    toast("Settings saved", "success");
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage site-wide settings and your profile</p>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
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
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm shrink-0">
            <Save className="w-3.5 h-3.5" />
            {savingProfile ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/20">
          <Globe size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">Site</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Logo Text</label>
          <input type="text" value={logoText} onChange={e => setLogoText(e.target.value)} placeholder="BMAC"
            className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
          <p className="text-xs text-muted-foreground/60 mt-1">Preview: <span className="font-display font-extrabold text-secondary">{logoText || "BMAC"}<span className="text-primary">.</span></span></p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-secondary/80">Social Links</label>
            <button type="button" onClick={() => setSocialLinks([...socialLinks, { name: "", href: "", icon: "" }])}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <Plus size={12} /> Add Social
            </button>
          </div>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-background border border-border/30 rounded-lg">
                <input type="text" value={link.name} onChange={e => {
                  const next = [...socialLinks]; next[i] = { ...next[i], name: e.target.value }; setSocialLinks(next);
                }} placeholder="Instagram"
                  className="flex-1 px-3 py-2 min-h-[40px] bg-muted/50 border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors" />
                <input type="text" value={link.href} onChange={e => {
                  const next = [...socialLinks]; next[i] = { ...next[i], href: e.target.value }; setSocialLinks(next);
                }} placeholder="https://..."
                  className="flex-[2] px-3 py-2 min-h-[40px] bg-muted/50 border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors" />
                <SocialLinkSelector value={link.icon} onChange={(v) => {
                  const next = [...socialLinks]; next[i] = { ...next[i], icon: v }; setSocialLinks(next);
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
          <input type="text" value={copyright} onChange={e => setCopyright(e.target.value)} placeholder="Brilliant Minds Ambassadors Club. All rights reserved."
            className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
        </div>

        <button onClick={handleSaveSite} disabled={savingSite}
          className="flex items-center justify-center gap-1.5 min-h-[44px] w-full px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
          <Save className="w-3.5 h-3.5" />
          {savingSite ? "Saving..." : "Save Site Settings"}
        </button>
      </div>
    </div>
  );
}
