"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, Heading1, Heading2, Link as LinkIcon,
  Eye, Code, ChevronDown, FileText,
} from "lucide-react";

interface EmailTemplateEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholders?: string[];
}

const DEFAULT_PLACEHOLDERS = [
  "{{firstName}}",
  "{{email}}",
  "{{eventName}}",
  "{{eventDate}}",
  "{{eventLocation}}",
  "{{programTitle}}",
  "{{kindLabel}}",
  "{{formLink}}",
  "{{passUrl}}",
  "{{loginUrl}}",
  "{{resetLink}}",
  "{{amountLabel}}",
  "{{reference}}",
  "{{status}}",
  "{{note}}",
  "{{donorName}}",
  "{{donorEmail}}",
  "{{dashboardUrl}}",
  "{{impactUrl}}",
  "{{body}}",
  "{{renewalDate}}",
  "{{password}}",
  "{{role}}",
  "{{loginLink}}",
  "{{actor}}",
  "{{deletedAdmin}}",
  "{{deletedBy}}",
  "{{reason}}",
  "{{originalTitle}}",
  "{{submitterName}}",
  "{{submitterEmail}}",
];

const SHELL_HEAD = (heading: string) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4">
<tr><td style="padding:40px 16px">
<table role="presentation" align="center" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="padding:40px 32px 32px;text-align:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">BMAC<span style="color:#f59e0b">.</span></h1>
<p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:3px">Brilliant Minds Ambassadors Club</p>
</td></tr>
<tr><td style="padding:32px 32px 0">
<h2 style="margin:0;color:#1a1a2e;font-size:20px;font-weight:700">${heading}</h2>`;

const SHELL_FOOTER = (footer?: string) => `
</td></tr>
<tr><td style="padding:0 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="border-top:1px solid #eee;padding:24px 0 32px">
<p style="margin:0;color:#999;font-size:13px;line-height:1.5">${footer || "This is an automated message from the Brilliant Minds Ambassadors Club. Please do not reply to this email."}</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const SHELL_CTA = (label: string, url: string) => `
<tr><td style="padding:24px 32px;text-align:center">
<a href="${url}" style="display:inline-block;padding:14px 36px;background-color:#f59e0b;color:#1a1a2e;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px">${label}</a>
</td></tr>
<tr><td style="padding:0 32px">
<p style="margin:0 0 12px;color:#bbb;font-size:12px;line-height:1.5">If the button above doesn't work, copy and paste this URL into your browser:<br>
<span style="color:#f59e0b;word-break:break-all">${url}</span></p>
</td></tr>`;

function buildShellHtml(heading: string, bodyHtml: string, ctaLabel: string, ctaUrl: string, footer: string) {
  let html = SHELL_HEAD(heading);
  html += `<p style="margin:12px 0 0;color:#555;font-size:15px;line-height:1.6">${bodyHtml}</p>`;
  if (ctaLabel && ctaUrl) {
    html += SHELL_CTA(ctaLabel, ctaUrl);
  }
  html += SHELL_FOOTER(footer || undefined);
  return html;
}

function parseTemplateHtml(html: string) {
  const result = { heading: "", body: "", ctaLabel: "", ctaUrl: "", footer: "" };

  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2Match) result.heading = h2Match[1].replace(/<[^>]+>/g, "").trim();

  const bodyMatch = html.match(/<h2[^>]*>[\s\S]*?<\/h2>\s*([\s\S]*?)(?:<tr><td[^>]*>\s*<table|$)/i);
  if (bodyMatch) {
    result.body = bodyMatch[1]
      .replace(/<p style="margin:12px[^"]*">([\s\S]*?)<\/p>/gi, "$1")
      .trim();
  }

  const ctaMatch = html.match(/<a[^>]*style="[^"]*background-color:#f59e0b[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (ctaMatch) result.ctaLabel = ctaMatch[1].replace(/<[^>]+>/g, "").trim();

  const ctaUrlMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*style="[^"]*background-color:#f59e0b/i);
  if (ctaUrlMatch) result.ctaUrl = ctaUrlMatch[1];

  const footerMatch = html.match(/<p style="margin:0;color:#999[^"]*">([\s\S]*?)<\/p>/i);
  if (footerMatch) result.footer = footerMatch[1].replace(/<[^>]+>/g, "").trim();

  return result;
}

export default function EmailTemplateEditor({ value, onChange, placeholders = DEFAULT_PLACEHOLDERS }: EmailTemplateEditorProps) {
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const [showPlaceholderDropdown, setShowPlaceholderDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseTemplateHtml(value), [value]);

  const [heading, setHeading] = useState(parsed.heading);
  const [ctaLabel, setCtaLabel] = useState(parsed.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(parsed.ctaUrl);
  const [footer, setFooter] = useState(parsed.footer);
  const [sourceHtml, setSourceHtml] = useState(value);

  useEffect(() => {
    const p = parseTemplateHtml(value);
    setHeading(p.heading);
    setCtaLabel(p.ctaLabel);
    setCtaUrl(p.ctaUrl);
    setFooter(p.footer);
    setSourceHtml(value);
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Write your email message..." }),
      Link.configure({ openOnClick: false, HTMLAttributes: { style: "color:#f59e0b;text-decoration:underline" } }),
    ],
    content: parsed.body || "",
    onUpdate: ({ editor: e }) => {
      const html = buildShellHtml(heading, e.getHTML(), ctaLabel, ctaUrl, footer);
      onChange(html);
    },
  }, []);

  useEffect(() => {
    if (editor && mode === "visual") {
      const currentContent = editor.getHTML();
      const newParsed = parseTemplateHtml(value);
      if (currentContent !== newParsed.body) {
        editor.commands.setContent(newParsed.body || "");
      }
    }
  }, []);

  const rebuildAndEmit = useCallback((h: string, body: string, cl: string, cu: string, f: string) => {
    const html = buildShellHtml(h, body, cl, cu, f);
    onChange(html);
  }, [onChange]);

  const handleHeadingChange = useCallback((v: string) => {
    setHeading(v);
    if (editor) rebuildAndEmit(v, editor.getHTML(), ctaLabel, ctaUrl, footer);
  }, [editor, ctaLabel, ctaUrl, footer, rebuildAndEmit]);

  const handleCtaLabelChange = useCallback((v: string) => {
    setCtaLabel(v);
    if (editor) rebuildAndEmit(heading, editor.getHTML(), v, ctaUrl, footer);
  }, [editor, heading, ctaUrl, footer, rebuildAndEmit]);

  const handleCtaUrlChange = useCallback((v: string) => {
    setCtaUrl(v);
    if (editor) rebuildAndEmit(heading, editor.getHTML(), ctaLabel, v, footer);
  }, [editor, heading, ctaLabel, footer, rebuildAndEmit]);

  const handleFooterChange = useCallback((v: string) => {
    setFooter(v);
    if (editor) rebuildAndEmit(heading, editor.getHTML(), ctaLabel, ctaUrl, v);
  }, [editor, heading, ctaLabel, ctaUrl, rebuildAndEmit]);

  const handleSourceChange = useCallback((v: string) => {
    setSourceHtml(v);
    onChange(v);
  }, [onChange]);

  const insertPlaceholder = useCallback((ph: string) => {
    if (mode === "visual" && editor) {
      editor.chain().focus().insertContent(ph).run();
    } else {
      const textarea = document.querySelector<HTMLTextAreaElement>("[data-source-textarea]");
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newVal = sourceHtml.substring(0, start) + ph + sourceHtml.substring(end);
        setSourceHtml(newVal);
        onChange(newVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + ph.length, start + ph.length);
        }, 0);
      }
    }
    setShowPlaceholderDropdown(false);
  }, [mode, editor, sourceHtml, onChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPlaceholderDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const previewHtml = useMemo(() => {
    if (mode === "visual") {
      return buildShellHtml(heading, editor?.getHTML() || "", ctaLabel, ctaUrl, footer);
    }
    return sourceHtml;
  }, [mode, heading, editor, ctaLabel, ctaUrl, footer, sourceHtml]);

  function inputCls() {
    return "w-full px-3 py-2.5 min-h-[40px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors";
  }

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/40 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-lg transition-all duration-200 ${
              mode === "visual"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("source")}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-lg transition-all duration-200 ${
              mode === "source"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Source
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowPlaceholderDropdown(!showPlaceholderDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200"
          >
            <FileText className="w-3.5 h-3.5" />
            Insert Variable
            <ChevronDown className="w-3 h-3" />
          </button>
          {showPlaceholderDropdown && (
            <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-64 overflow-y-auto bg-card border border-border rounded-xl shadow-lg p-1.5">
              {placeholders.map(ph => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => insertPlaceholder(ph)}
                  className="w-full text-left px-3 py-2 text-xs font-mono text-secondary hover:bg-muted rounded-lg transition-colors truncate"
                >
                  {ph}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
        <div className={`border-b lg:border-b-0 lg:border-r border-border/50 ${mode === "visual" ? "flex flex-col" : ""}`}>
          {mode === "visual" ? (
            <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Heading</label>
                <input
                  type="text"
                  value={heading}
                  onChange={e => handleHeadingChange(e.target.value)}
                  placeholder="Email heading..."
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Message</label>
                <div className="border border-border/50 rounded-lg overflow-hidden bg-background/60">
                  <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/30 bg-muted/10">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md transition-all duration-150 ${
                        editor?.isActive("bold") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md transition-all duration-150 ${
                        editor?.isActive("italic") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md transition-all duration-150 ${
                        editor?.isActive("heading", { level: 2 }) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
                      }`}
                      title="Heading"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt("Enter URL:");
                        if (url) editor?.chain().focus().setLink({ href: url }).run();
                      }}
                      className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md transition-all duration-150 ${
                        editor?.isActive("link") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
                      }`}
                      title="Link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none p-3 min-h-[150px] text-sm text-secondary [&_.tiptap]:outline-none [&_.tiptap_p]:mb-2 [&_.tiptap_p:last-child]:mb-0 [&_.tiptap_h2]:text-base [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mb-2 [&_.tiptap_strong]:font-bold [&_.tiptap_u]:underline [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:ml-4 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:ml-4 [&_.tiptap_li]:mb-1 [&_.tiptap_a]:text-primary [&_.tiptap_a]:underline [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground/40 [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">CTA Button Label</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={e => handleCtaLabelChange(e.target.value)}
                    placeholder="e.g. Sign In"
                    className={inputCls()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">CTA Button URL</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={e => handleCtaUrlChange(e.target.value)}
                    placeholder="e.g. {{loginUrl}}"
                    className={inputCls()}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Footer Text</label>
                <input
                  type="text"
                  value={footer}
                  onChange={e => handleFooterChange(e.target.value)}
                  placeholder="Automated message footer..."
                  className={inputCls()}
                />
              </div>
            </div>
          ) : (
            <textarea
              data-source-textarea
              value={sourceHtml}
              onChange={e => handleSourceChange(e.target.value)}
              className="w-full h-full min-h-[400px] p-4 bg-transparent text-secondary resize-none focus:outline-none font-mono text-xs leading-relaxed placeholder:text-muted-foreground/30"
              placeholder="Paste your email HTML here..."
            />
          )}
        </div>

        <div className="bg-muted/10 overflow-y-auto max-h-[500px]">
          <div className="px-3 py-1.5 border-b border-border/30 bg-muted/10">
            <span className="text-xs font-medium text-muted-foreground">Preview</span>
          </div>
          <iframe
            srcDoc={previewHtml}
            className="w-full min-h-[380px] border-0"
            title="Email preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
