const baseFont =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;line-height:1.6;font-size:15px;";
const baseStyle = `${baseFont}margin:0 0 14px;`;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(text: string): string {
  const safe = escapeHtml(text);
  return safe
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="font-family:\'SFMono-Regular\',Consolas,monospace;background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:13px;">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#9d5c2b;text-decoration:underline;" target="_blank" rel="noopener noreferrer">$1</a>');
}

const h1 = (c: string) => `<h1 style="${baseFont}font-size:26px;font-weight:700;margin:24px 0 12px;">${c}</h1>`;
const h2 = (c: string) => `<h2 style="${baseFont}font-size:21px;font-weight:700;margin:20px 0 10px;">${c}</h2>`;
const h3 = (c: string) => `<h3 style="${baseFont}font-size:17px;font-weight:600;margin:16px 0 8px;">${c}</h3>`;
const hr = '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />';

function processBlock(text: string): string {
  return text.split("\n\n").map((block) => {
    block = block.trim();
    if (!block) return "";

    if (block === "---" || block === "***") return hr;

    const h1Match = block.match(/^#\s+(.*)/);
    if (h1Match) return h1(inline(h1Match[1]));

    const h2Match = block.match(/^##\s+(.*)/);
    if (h2Match) return h2(inline(h2Match[1]));

    const h3Match = block.match(/^###\s+(.*)/);
    if (h3Match) return h3(inline(h3Match[1]));

    if (block.startsWith("> ")) {
      const content = block.replace(/^>\s?/gm, "");
      return `<blockquote style="${baseFont}border-left:4px solid #e5e7eb;padding:2px 0 2px 16px;color:#6b7280;font-style:italic;margin:0 0 14px;">${inline(content)}</blockquote>`;
    }

    const lines = block.split("\n");

    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      const items = lines.map((l) => {
        const content = l.replace(/^\s*[-*]\s+/, "");
        return `<li style="${baseStyle}margin:0 0 6px;">${inline(content)}</li>`;
      }).join("");
      return `<ul style="${baseFont}font-size:15px;margin:0 0 14px;padding-left:22px;">${items}</ul>`;
    }

    if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      const items = lines.map((l) => {
        const content = l.replace(/^\s*\d+\.\s+/, "");
        return `<li style="${baseStyle}margin:0 0 6px;">${inline(content)}</li>`;
      }).join("");
      return `<ol style="${baseFont}font-size:15px;margin:0 0 14px;padding-left:22px;">${items}</ol>`;
    }

    if (/^```/.test(block)) {
      const code = escapeHtml(block.replace(/^```\w*\n?/, "").replace(/\n?```$/, ""));
      return `<pre style="${baseFont}background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:12px;overflow-x:auto;font-size:13px;"><code style="font-family:'SFMono-Regular',Consolas,monospace;font-size:13px;">${code}</code></pre>`;
    }

    if (/^\|/.test(block)) {
      const rows = lines.filter((l) => !/^\|[\s-|]+\|$/.test(l));
      const headerCells = (rows[0] || "").split("|").slice(1, -1).map((c) => c.trim());
      const bodyRows = rows.slice(1);
      const ths = headerCells.map((c) => `<th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left;font-size:13px;font-weight:600;">${inline(c)}</th>`).join("");
      const trs = bodyRows.map((row) => {
        const cells = row.split("|").slice(1, -1).map((c) => c.trim());
        return `<tr>${cells.map((c) => `<td style="border:1px solid #e5e7eb;padding:8px 10px;font-size:13px;">${inline(c)}</td>`).join("")}</tr>`;
      }).join("");
      return `<table style="width:100%;border-collapse:collapse;margin:0 0 14px;"><thead style="background:#f9fafb;"><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    }

    return `<p style="${baseStyle}">${inline(block)}</p>`;
  }).filter(Boolean).join("\n");
}

export function markdownToHtml(markdown: string): string {
  const source = (markdown || "").trim();
  if (!source) return "";
  return processBlock(source);
}
