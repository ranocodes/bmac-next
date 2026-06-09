"use client";

import { useEffect, useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { getItem, setItem } from "@/data/store";
import IconPicker from "@/components/ui/IconPicker";
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

export default function SettingsForm() {
  const [logoText, setLogoText] = useState("");
  const [socialLinks, setSocialLinks] = useState<{ name: string; href: string; icon: string }[]>([]);
  const [copyright, setCopyright] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingCred, setSavingCred] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = getItem<any>("site_settings");
    const s = stored || DEFAULT;
    setLogoText(s.logo_text || "BMAC");
    setSocialLinks(s.social_links || DEFAULT.social_links);
    setCopyright(s.copyright || DEFAULT.copyright);

    const creds = getItem<{ email: string; password: string }>("admin_credentials");
    if (creds) {
      setCredEmail(creds.email);
      setCredPassword(creds.password);
    } else {
      const session = getItem<{ email: string }>("session");
      if (session) setCredEmail(session.email);
    }
  }, []);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setItem("site_settings", {
        id: "settings-1",
        logo_text: logoText,
        navigation: DEFAULT.navigation,
        social_links: socialLinks,
        copyright,
      });
      setSaving(false);
      toast("Settings saved", "success");
    }, 300);
  }

  function handleSaveCredentials() {
    if (!credEmail || !credPassword) { toast("Email and password required", "error"); return; }
    setSavingCred(true);
    setTimeout(() => {
      setItem("admin_credentials", { email: credEmail, password: credPassword });
      setSavingCred(false);
      toast("Login credentials updated", "success");
    }, 300);
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage site-wide settings</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Logo Text</label>
            <input
              type="text"
              value={logoText}
              onChange={e => setLogoText(e.target.value)}
              placeholder="BMAC"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-secondary/80">Social Links</label>
              <button
                type="button"
                onClick={() => setSocialLinks([...socialLinks, { name: "", href: "", icon: "" }])}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={12} /> Add Social
              </button>
            </div>
            <div className="space-y-3">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-background border border-border/30 rounded-lg">
                  <input
                    type="text"
                    value={link.name}
                    onChange={e => {
                      const next = [...socialLinks];
                      next[i] = { ...next[i], name: e.target.value };
                      setSocialLinks(next);
                    }}
                    placeholder="Instagram"
                    className="flex-1 px-3 py-2 min-h-[40px] bg-muted/50 border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={e => {
                      const next = [...socialLinks];
                      next[i] = { ...next[i], href: e.target.value };
                      setSocialLinks(next);
                    }}
                    placeholder="https://..."
                    className="flex-[2] px-3 py-2 min-h-[40px] bg-muted/50 border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <IconPicker value={link.icon} onChange={(v) => {
                      const next = [...socialLinks];
                      next[i] = { ...next[i], icon: v };
                      setSocialLinks(next);
                    }} />
                    <button
                      type="button"
                      onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Copyright</label>
            <input
              type="text"
              value={copyright}
              onChange={e => setCopyright(e.target.value)}
              placeholder="Brilliant Minds Ambassadors Club. All rights reserved."
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-secondary">Admin Credentials</h2>
          <p className="text-xs text-muted-foreground -mt-2">Update your login email and password. Next login will require these credentials.</p>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Email</label>
            <input type="email" value={credEmail} onChange={e => setCredEmail(e.target.value)} placeholder="admin@bmacjos.org"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Password</label>
            <input type="password" value={credPassword} onChange={e => setCredPassword(e.target.value)} placeholder="New password"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
          </div>
          <button
            type="button"
            disabled={savingCred}
            onClick={handleSaveCredentials}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {savingCred ? "Saving..." : "Update Credentials"}
          </button>
        </div>

        {!saving && (
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
