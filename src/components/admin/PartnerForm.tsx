"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createItem, updateItem } from "@/actions/crud";
import { useAdmin } from "@/lib/auth/admin-context";
import ImagePicker from "@/components/ui/ImagePicker";
import { useToast } from "@/components/ui/Toast";
import type { Partner } from "@/types/cms";

export default function PartnerForm({ initialData }: { initialData?: Partner | null }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const user = useAdmin();

  const [name, setName] = useState(initialData?.name || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [status, setStatus] = useState<"active" | "hidden">(initialData?.status || "active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const { toast } = useToast();

  async function handleSubmit() {
    if (!user?.permissions.includes("manage_partners")) {
      setError("You don't have permission to manage partners");
      return;
    }
    setError("");
    setMissingFields([]);

    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!logo) missing.push("logo");
    if (missing.length > 0) {
      setMissingFields(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && params?.id) {
        await updateItem("partners", params.id as string, { name, url, logo, status });
        toast("Partner updated", "success");
      } else {
        const id = `partner-${Date.now()}`;
        await createItem("partners", { id, name, url, logo, status, order: 1 });
        toast("Partner created", "success");
      }
      router.push("/admin/partners");
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/partners" className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted text-secondary hover:bg-muted/70 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">{isEdit ? "Edit Partner" : "New Partner"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? "Update partner organization details" : "Add a new partner organization"}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Organization Name <span className="text-destructive">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="UNICEF"
            className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors ${missingFields.includes("name") ? "border-destructive" : "border-border focus:border-primary/50"}`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Website URL</label>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.unicef.org"
            className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Logo <span className="text-destructive">*</span></label>
          {logo && (
            <div className="mb-2 flex items-center gap-3 p-2 bg-background border border-border/30 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {logo && !logo.includes("placeholder") ? (
                  <img src={logo} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                    {name ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2) : "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-secondary truncate">{logo}</p>
                <button onClick={() => setLogo("")} className="text-[10px] text-destructive hover:underline">Remove</button>
              </div>
            </div>
          )}
          <button type="button" onClick={() => setShowPicker(true)}
            className={`w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm transition-colors ${missingFields.includes("logo") ? "border-destructive text-muted-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}>
            {logo ? "Change Logo" : "Select Logo"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary/80 mb-1.5">Visibility</label>
          <div className="flex gap-2">
            {(["active", "hidden"] as const).map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg text-sm font-medium capitalize transition-all ${status === s ? "bg-primary text-primary-foreground" : "bg-background border border-border text-secondary hover:border-primary/50"}`}>
                {s === "active" ? <Eye size={15} /> : <EyeOff size={15} />}
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : isEdit ? "Update Partner" : "Create Partner"}
        </button>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <ImagePicker value={logo} onChange={(url: string) => { setLogo(url); setShowPicker(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}
