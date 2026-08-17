import { describe, it, expect } from "vitest";
import { markdownToHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  it("renders empty markdown as empty string", () => {
    expect(markdownToHtml("")).toBe("");
    expect(markdownToHtml("   ")).toBe("");
  });

  it("renders bold, emphasis, and headings with inline styles", () => {
    const html = markdownToHtml("## Hello **world** and *wow*");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong");
    expect(html).toContain("font-weight:700");
    expect(html).toContain("<em");
  });

  it("renders links with target and rel", () => {
    const html = markdownToHtml("[BMAC](https://bmac.com)");
    expect(html).toContain('href="https://bmac.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders ordered and unordered lists", () => {
    const html = markdownToHtml("- one\n- two\n\n1. first\n2. second");
    expect(html).toContain("<ul");
    expect(html).toContain("<ol");
    expect(html).toContain("<li");
  });

  it("renders blockquotes and code", () => {
    const html = markdownToHtml("> a quote\n\n`inline`\n\n```ts\nconst x = 1;\n```");
    expect(html).toContain("<blockquote");
    expect(html).toContain("<code");
    expect(html).toContain("<pre");
  });

  it("sanitizes raw HTML (no rehype-raw)", () => {
    const html = markdownToHtml("**bold** <script>alert(1)</script>");
    expect(html).not.toContain("<script");
    expect(html).toContain("<strong");
    expect(html).toContain("&lt;script&gt;");
  });

  it("does not pass through image alt as executable markup", () => {
    const html = markdownToHtml('![onerror="x"](https://evil.com/x.png)');
    expect(html).toContain('alt="onerror=&quot;x&quot;"');
    expect(html).toContain('src="https://evil.com/x.png"');
  });
});
