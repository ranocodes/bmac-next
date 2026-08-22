"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExt from "@tiptap/extension-link";
import {
  Bold, Italic, Heading2, Link as LinkIcon, List, ListOrdered,
  Eye, Code, ChevronDown, FileText, Undo, Redo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholders?: string[];
  minHeight?: number;
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
  "{{dashboardUrl}}",
  "{{impactUrl}}",
  "{{body}}",
  "{{password}}",
  "{{role}}",
  "{{loginLink}}",
  "{{actor}}",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholders = DEFAULT_PLACEHOLDERS,
  minHeight = 300,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const [showPlaceholderDropdown, setShowPlaceholderDropdown] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value);
  const [tick, setTick] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: "Write your email content..." }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { style: "color:#f59e0b;text-decoration:underline" },
      }),
    ],
    content: value || "",
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html);
      setTick(t => t + 1);
    },
  }, []);

  useEffect(() => {
    if (editor && mode === "visual") {
      const current = editor.getHTML();
      if (current !== value && value !== sourceHtml) {
        editor.commands.setContent(value || "");
      }
    }
  }, [value]);

  const switchMode = useCallback((next: "visual" | "source") => {
    if (next === "source" && editor) {
      setSourceHtml(editor.getHTML());
    }
    setMode(next);
  }, [editor]);

  const handleSourceChange = useCallback((v: string) => {
    setSourceHtml(v);
    onChange(v);
    setTick(t => t + 1);
  }, [onChange]);

  const insertPlaceholder = useCallback((ph: string) => {
    if (mode === "visual" && editor) {
      editor.chain().focus().insertContent(ph).run();
    } else if (sourceRef.current) {
      const textarea = sourceRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newVal = sourceHtml.substring(0, start) + ph + sourceHtml.substring(end);
      setSourceHtml(newVal);
      onChange(newVal);
      setTick(t => t + 1);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + ph.length, start + ph.length);
      }, 0);
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

  const previewHtml = mode === "visual"
    ? (editor?.getHTML() || "")
    : sourceHtml;

  function ToolbarBtn({
    active,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md transition-all duration-150 ${
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/40 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchMode("visual")}
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
            onClick={() => switchMode("source")}
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
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/30 bg-muted/10">
                <ToolbarBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <ToolbarBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <ToolbarBtn active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
                  <Heading2 className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <ToolbarBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">
                  <List className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <ToolbarBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List">
                  <ListOrdered className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={editor?.isActive("link")}
                  onClick={() => {
                    const url = window.prompt("Enter URL:");
                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                  }}
                  title="Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
                  <Undo className="w-3.5 h-3.5" />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
                  <Redo className="w-3.5 h-3.5" />
                </ToolbarBtn>
              </div>
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-3 flex-1 text-sm text-secondary overflow-y-auto"
                style={{ minHeight }}
              />
            </div>
          ) : (
            <textarea
              ref={sourceRef}
              data-richtext-source
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
            key={tick}
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#333">${previewHtml}</body></html>`}
            className="w-full min-h-[380px] border-0"
            title="Email preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
