"use client";

const SERIES_COLORS = ["#10b981", "#3b82f6", "#a855f7", "#f43f5e", "#f59e0b", "#06b6d4", "#6366f1", "#ec4899"];

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function DailyViewsAreaChart({ data }: { data: { date: string; views: number; visitors: number }[] }) {
  if (!data.length) return <EmptyChart message="No traffic yet — visit the public site to start collecting data." />;

  const W = 600;
  const H = 240;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(1, ...data.map(d => Math.max(d.views, d.visitors)));
  const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const line = (key: "views" | "visitors") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const area = `${line("views")} L${x(data.length - 1).toFixed(1)},${PAD.top + innerH} L${x(0).toFixed(1)},${PAD.top + innerH} Z`;

  const ticks = 5;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((maxVal / ticks) * i));
  const xTickEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64" role="img" aria-label="Daily views and visitors">
      {yTicks.map(t => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(t) + 3} textAnchor="end" fontSize="10" className="fill-muted-foreground">
            {t}
          </text>
        </g>
      ))}
      <defs>
        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SERIES_COLORS[0]} stopOpacity="0.35" />
          <stop offset="100%" stopColor={SERIES_COLORS[0]} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#viewsFill)" />
      <path d={line("views")} fill="none" stroke={SERIES_COLORS[0]} strokeWidth="2" strokeLinejoin="round" />
      <path d={line("visitors")} fill="none" stroke={SERIES_COLORS[1]} strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) =>
        i % xTickEvery === 0 ? (
          <text key={d.date} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" className="fill-muted-foreground">
            {formatShortDate(d.date)}
          </text>
        ) : null
      )}
    </svg>
  );
}

export function TopPagesBarChart({ data }: { data: { path: string; views: number }[] }) {
  if (!data.length) return <EmptyChart message="No page views recorded yet." />;
  const maxVal = Math.max(1, ...data.map(d => d.views));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.path}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-secondary font-mono text-xs truncate pr-3" title={d.path}>
              {d.path}
            </span>
            <span className="text-muted-foreground text-xs">{d.views}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.views / maxVal) * 100}%`, backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Donut({ data, centerLabel }: { data: { label: string; value: number }[]; centerLabel?: string }) {
  if (!data.length) return null;
  const total = data.reduce((a, b) => a + b.value, 0);
  const R = 80;
  const CIRC = 2 * Math.PI * R;

  const { segments } = data.reduce(
    (acc, d, i) => {
      const dash = total ? (d.value / total) * CIRC : 0;
      acc.segments.push({ dash, offset: acc.offset, color: SERIES_COLORS[i % SERIES_COLORS.length] });
      acc.offset += dash;
      return acc;
    },
    { segments: [] as { dash: number; offset: number; color: string }[], offset: 0 }
  );

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto" role="img">
      {segments.map((s, i) => (
        <circle
          key={data[i].label}
          r={R}
          cx="100"
          cy="100"
          fill="none"
          stroke={s.color}
          strokeWidth="26"
          strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
          strokeDashoffset={-s.offset}
          transform="rotate(-90 100 100)"
        />
      ))}
      {centerLabel ? (
        <text x="100" y="105" textAnchor="middle" fontSize="26" fontWeight="700" className="fill-secondary">
          {centerLabel}
        </text>
      ) : null}
    </svg>
  );
}

function Legend({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div className="grid grid-cols-1 gap-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-secondary">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            {d.label}
          </span>
          <span className="text-muted-foreground text-xs">
            {d.value} · {Math.round((d.value / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function DevicePieChart({ data }: { data: { type: string; count: number }[] }) {
  if (!data.length) return <EmptyChart message="No device data collected yet." />;
  const items = data.map(d => ({ label: d.type, value: d.count }));
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <Donut data={items} />
      <Legend data={items} />
    </div>
  );
}

export function ReferrersRingChart({ data }: { data: { host: string; views: number }[] }) {
  if (!data.length) return <EmptyChart message="No referrer data collected yet." />;
  const items = data.map(d => ({ label: d.host, value: d.views }));
  const total = items.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <Donut data={items} centerLabel={String(total)} />
      <Legend data={items} />
    </div>
  );
}

const FUNNEL_LABELS: Record<string, string> = {
  page_view: "Page views",
  event_registered: "Event registrations",
  donation_completed: "Donations",
};

export function ConversionFunnelChart({ data }: { data: { step: string; count: number; rate: number }[] }) {
  if (!data.length) return <EmptyChart message="No conversion data yet." />;
  const maxCount = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={d.step}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-secondary">{FUNNEL_LABELS[d.step] || d.step.replace(/_/g, " ")}</span>
            <span className="text-muted-foreground text-xs">
              {d.count} · {d.rate}%
            </span>
          </div>
          <div className="flex justify-center">
            <div
              className="h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white/90 transition-all"
              style={{
                width: `${Math.max(8, (d.count / maxCount) * 100)}%`,
                backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length],
                opacity: 0.55 + 0.45 * (i / Math.max(1, data.length - 1)),
              }}
            >
              {d.rate}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
