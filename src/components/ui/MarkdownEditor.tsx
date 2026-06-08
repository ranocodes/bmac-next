"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Bold, Italic, Heading1, Heading2, Link as LinkIcon,
  Image, List, ListOrdered, Quote, Code, Minus, Eye, EyeOff,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

type P = { children?: React.ReactNode };
type CP = { className?: string; children?: React.ReactNode };
type AP = { href?: string; children?: React.ReactNode };

const previewComponents = {
  h1: ({ children, ...rest }: P) => <h1 className="text-2xl font-bold text-secondary mt-6 mb-3" {...rest}>{children}</h1>,
  h2: ({ children, ...rest }: P) => <h2 className="text-xl font-bold text-secondary mt-5 mb-2" {...rest}>{children}</h2>,
  h3: ({ children, ...rest }: P) => <h3 className="text-lg font-semibold text-secondary mt-4 mb-2" {...rest}>{children}</h3>,
  p: ({ children, ...rest }: P) => <p className="text-secondary/80 mb-3 leading-relaxed" {...rest}>{children}</p>,
  a: ({ href, children, ...rest }: AP) => (
    <a href={href} className="text-primary underline hover:no-underline" {...rest}>{children}</a>
  ),
  ul: ({ children, ...rest }: P) => <ul className="list-disc list-inside mb-3 space-y-1 text-secondary/80" {...rest}>{children}</ul>,
  ol: ({ children, ...rest }: P) => <ol className="list-decimal list-inside mb-3 space-y-1 text-secondary/80" {...rest}>{children}</ol>,
  li: ({ children, ...rest }: P) => <li className="text-secondary/80 mb-1" {...rest}>{children}</li>,
  blockquote: ({ children, ...rest }: P) => (
    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...rest}>
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...rest }: CP) => {
    if (className) {
      return (
        <pre className="bg-muted/80 border border-border/30 rounded-xl p-4 my-4 overflow-x-auto">
          <code className="text-primary text-sm font-mono" {...rest}>{children}</code>
        </pre>
      );
    }
    return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...rest}>{children}</code>;
  },
  pre: ({ children, ...rest }: P) => <>{children}</>,
  hr: () => <hr className="border-border/20 my-6" />,
  strong: ({ children, ...rest }: P) => <strong className="font-bold text-secondary" {...rest}>{children}</strong>,
  em: ({ children, ...rest }: P) => <em className="italic text-secondary" {...rest}>{children}</em>,
  table: ({ children, ...rest }: P) => <table className="w-full border-collapse my-4" {...rest}>{children}</table>,
  thead: ({ children, ...rest }: P) => <thead className="bg-muted/30" {...rest}>{children}</thead>,
  th: ({ children, ...rest }: P) => (
    <th className="border border-border/50 px-3 py-2 text-left text-sm font-semibold text-secondary" {...rest}>
      {children}
    </th>
  ),
  td: ({ children, ...rest }: P) => (
    <td className="border border-border/50 px-3 py-2 text-sm text-secondary/80" {...rest}>{children}</td>
  ),
};

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [splitView, setSplitView] = useState(true);

  const insertText = useCallback((before: string, after = "", placeholderText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || placeholderText;
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + selected.length;
      textarea.setSelectionRange(start + before.length, cursorPos);
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b": e.preventDefault(); insertText("**", "**", "bold text"); break;
        case "i": e.preventDefault(); insertText("*", "*", "italic text"); break;
        case "k": e.preventDefault(); insertText("[", "](url)", "link text"); break;
      }
    }
  }, [insertText]);

  const tools = [
    { icon: Bold, action: () => insertText("**", "**", "bold"), title: "Bold (Ctrl+B)" },
    { icon: Italic, action: () => insertText("*", "*", "italic"), title: "Italic (Ctrl+I)" },
    { icon: Heading1, action: () => insertText("\n# ", "", "Heading 1"), title: "Heading 1" },
    { icon: Heading2, action: () => insertText("\n## ", "", "Heading 2"), title: "Heading 2" },
    { icon: LinkIcon, action: () => insertText("[", "](url)", "link text"), title: "Link (Ctrl+K)" },
    { icon: Image, action: () => insertText("![alt](", ")", "image-url"), title: "Image" },
    { icon: List, action: () => insertText("\n- ", "", "list item"), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertText("\n1. ", "", "list item"), title: "Numbered List" },
    { icon: Quote, action: () => insertText("\n> ", "", "quote"), title: "Quote" },
    { icon: Code, action: () => insertText("`", "`", "code"), title: "Inline Code" },
    { icon: Minus, action: () => insertText("\n---\n", ""), title: "Horizontal Rule" },
  ];

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-background/40 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-3 py-2 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
          {tools.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={t.action}
              title={t.title}
              aria-label={t.title}
              className="p-1.5 sm:p-2 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
            >
              <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSplitView(!splitView)}
            className={`px-2 py-1.5 min-h-[32px] text-xs font-medium rounded-lg transition-all duration-200 ${
              splitView
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg transition-all duration-200 ${
              showPreview
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className={`grid ${splitView ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className={`${splitView ? "border-b lg:border-b-0 lg:border-r border-border/50" : ""}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-56 sm:h-72 lg:h-[500px] p-3 sm:p-4 bg-transparent text-secondary resize-none focus:outline-none font-mono text-sm leading-relaxed placeholder:text-muted-foreground/30"
            placeholder={placeholder || "Write your content in Markdown..."}
          />
        </div>

        {(showPreview || splitView) && (
          <div
            ref={previewRef}
            className="h-56 sm:h-72 lg:h-[500px] p-3 sm:p-4 lg:p-6 overflow-y-auto bg-muted/20"
          >
            <ReactMarkdown components={previewComponents} rehypePlugins={[rehypeRaw]}>
              {value || "*Start writing to see preview...*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
