"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || "Start writing..." }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[400px] md:min-h-[500px] px-4 py-3 text-sm text-secondary",
      },
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isDestroyed) {
      const current = editor.getHTML();
      if (current !== value) {
        editor.commands.setContent(value);
      }
    }
  }, [editor, value]);

  const tools = [
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold"), label: "Bold" },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic"), label: "Italic" },
    { icon: Heading1, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }), label: "Heading" },
    { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive("heading", { level: 3 }), label: "Subheading" },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList"), label: "Bullet list" },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList"), label: "Ordered list" },
    { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), active: editor?.isActive("blockquote"), label: "Quote" },
    { icon: Undo, action: () => editor?.chain().focus().undo().run(), active: false, label: "Undo" },
    { icon: Redo, action: () => editor?.chain().focus().redo().run(), active: false, label: "Redo" },
  ];

  return (
    <div className="border border-input bg-background rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/50 bg-muted/30 flex-wrap">
        {tools.map(t => (
          <button
            key={t.label}
            type="button"
            onClick={t.action}
            title={t.label}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
              t.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-secondary hover:bg-muted"
            }`}
          >
            <t.icon size={15} />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
