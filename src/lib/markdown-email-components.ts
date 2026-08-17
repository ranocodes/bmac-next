import { createElement, Fragment } from "react";

const baseFont =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;line-height:1.6;";

function cssToStyle(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const key = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!key || !val) continue;
    out[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  }
  return out;
}

function h(tag: string, props: Record<string, unknown>, children?: React.ReactNode) {
  const next = { ...props };
  if (typeof next.style === "string") next.style = cssToStyle(next.style);
  return createElement(tag, next, children);
}

export const emailComponents = {
  h1: ({ children }: { children?: React.ReactNode }) =>
    h("h1", { style: `${baseFont}font-size:26px;font-weight:700;margin:24px 0 12px;` }, children),
  h2: ({ children }: { children?: React.ReactNode }) =>
    h("h2", { style: `${baseFont}font-size:21px;font-weight:700;margin:20px 0 10px;` }, children),
  h3: ({ children }: { children?: React.ReactNode }) =>
    h("h3", { style: `${baseFont}font-size:17px;font-weight:600;margin:16px 0 8px;` }, children),
  p: ({ children }: { children?: React.ReactNode }) =>
    h("p", { style: `${baseFont}font-size:15px;margin:0 0 14px;` }, children),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    h("a", { href, style: "color:#9d5c2b;text-decoration:underline;", target: "_blank", rel: "noopener noreferrer" }, children),
  ul: ({ children }: { children?: React.ReactNode }) =>
    h("ul", { style: `${baseFont}font-size:15px;margin:0 0 14px;padding-left:22px;` }, children),
  ol: ({ children }: { children?: React.ReactNode }) =>
    h("ol", { style: `${baseFont}font-size:15px;margin:0 0 14px;padding-left:22px;` }, children),
  li: ({ children }: { children?: React.ReactNode }) =>
    h("li", { style: `${baseFont}font-size:15px;margin:0 0 6px;` }, children),
  blockquote: ({ children }: { children?: React.ReactNode }) =>
    h("blockquote", { style: `${baseFont}border-left:4px solid #e5e7eb;padding:2px 0 2px 16px;color:#6b7280;font-style:italic;margin:0 0 14px;` }, children),
  strong: ({ children }: { children?: React.ReactNode }) =>
    h("strong", { style: "font-weight:700;" }, children),
  em: ({ children }: { children?: React.ReactNode }) =>
    h("em", { style: "font-style:italic;" }, children),
  hr: () => h("hr", { style: "border:none;border-top:1px solid #e5e7eb;margin:20px 0;" }),
  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    if (className) {
      return h("pre", { style: `${baseFont}background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:12px;overflow-x:auto;font-size:13px;` },
        h("code", { style: "font-family:'SFMono-Regular',Consolas,monospace;font-size:13px;" }, children));
    }
    return h("code", { style: "font-family:'SFMono-Regular',Consolas,monospace;background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:13px;" }, children);
  },
  pre: ({ children }: { children?: React.ReactNode }) => createElement(Fragment, {}, children),
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) =>
    h("img", { src: src ? String(src) : undefined, alt, style: "max-width:100%;height:auto;border-radius:8px;margin:12px 0;" }),
  table: ({ children }: { children?: React.ReactNode }) =>
    h("table", { style: "width:100%;border-collapse:collapse;margin:0 0 14px;" }, children),
  thead: ({ children }: { children?: React.ReactNode }) =>
    h("thead", { style: "background:#f9fafb;" }, children),
  th: ({ children }: { children?: React.ReactNode }) =>
    h("th", { style: "border:1px solid #e5e7eb;padding:8px 10px;text-align:left;font-size:13px;font-weight:600;" }, children),
  td: ({ children }: { children?: React.ReactNode }) =>
    h("td", { style: "border:1px solid #e5e7eb;padding:8px 10px;font-size:13px;" }, children),
};
