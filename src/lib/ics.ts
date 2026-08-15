function to24h(time: string): string {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return "10:00:00";
  let h = parseInt(m[1], 10);
  const min = m[2] || "00";
  const ap = (m[3] || "AM").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}:00`;
}

function toIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function buildIcs(opts: { title: string; date: string; time: string; venue: string; description?: string }): string {
  const start = new Date(`${opts.date}T${to24h(opts.time)}`);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = new Date();
  const uid = `${opts.title.replace(/\W+/g, "-")}-${toIcsDate(start)}@bmacjos.org`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BMAC//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsDate(stamp)}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeText(opts.title)}`,
    `LOCATION:${escapeText(opts.venue)}`,
  ];
  if (opts.description) {
    lines.push(`DESCRIPTION:${escapeText(opts.description)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(ics: string, filename: string) {
  if (!ics) return;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
