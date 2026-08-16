"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Smartphone, Monitor } from "lucide-react";
import { emailComponents } from "@/lib/markdown-email-components";

interface EmailPreviewProps {
  subject: string;
  markdown: string;
}

const FROM_LINE = "Brilliant Minds Ambassadors Club <no-reply@bmac.com>";

export default function EmailPreview({ subject, markdown }: EmailPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/40">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-border/50 bg-muted/20">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Preview</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            title="Desktop preview"
            aria-label="Desktop preview"
            className={`p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg transition-all duration-200 ${
              device === "desktop" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            title="Mobile preview"
            aria-label="Mobile preview"
            className={`p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg transition-all duration-200 ${
              device === "mobile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className={`p-3 sm:p-4 ${device === "mobile" ? "flex justify-center" : ""}`}>
        <div
          className={`bg-white rounded-xl border border-border/40 overflow-hidden ${
            device === "mobile" ? "w-[340px] max-w-full" : "w-full"
          }`}
        >
          <div className="px-4 py-3 border-b border-border/30 bg-muted/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Inbox</p>
            <p className="text-sm font-semibold text-secondary truncate">{subject || "Subject line"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              From {FROM_LINE} · To Subscribers
            </p>
          </div>
          <div className="px-4 py-4 max-h-[420px] overflow-y-auto bg-white">
            {markdown ? (
              <ReactMarkdown components={emailComponents}>{markdown}</ReactMarkdown>
            ) : (
              <p className="text-sm text-muted-foreground">Start writing to see a preview of your email…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
