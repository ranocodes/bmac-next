"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface LocationMapProps {
  location?: string;
  coordinates?: string;
  className?: string;
}

const ROADS = [
  "M 0 80 Q 200 80 400 70",
  "M 0 120 Q 150 130 300 120",
  "M 50 180 Q 200 170 400 185",
  "M 0 230 Q 100 220 250 235",
  "M 80 0 Q 70 100 80 200",
  "M 150 0 Q 160 100 140 200",
  "M 250 0 Q 240 100 260 200",
  "M 350 0 Q 340 100 350 300",
  "M 0 50 Q 100 100 150 200",
  "M 300 150 Q 350 200 400 250",
  "M 200 0 Q 250 150 400 100",
  "M 100 280 Q 200 200 400 300",
  "M 80 80 Q 120 90 150 80",
  "M 250 120 Q 280 140 300 120",
];

const BUILDINGS = [
  { x: 60, y: 55, w: 28, h: 28 },
  { x: 100, y: 50, w: 35, h: 22 },
  { x: 150, y: 62, w: 22, h: 30 },
  { x: 200, y: 45, w: 30, h: 25 },
  { x: 40, y: 140, w: 25, h: 20 },
  { x: 130, y: 135, w: 32, h: 24 },
  { x: 220, y: 150, w: 20, h: 28 },
  { x: 300, y: 130, w: 35, h: 20 },
  { x: 20, y: 200, w: 22, h: 15 },
  { x: 90, y: 195, w: 28, h: 20 },
  { x: 180, y: 205, w: 25, h: 18 },
  { x: 260, y: 190, w: 30, h: 22 },
  { x: 320, y: 60, w: 20, h: 35 },
  { x: 360, y: 155, w: 25, h: 18 },
  { x: 50, y: 250, w: 20, h: 15 },
  { x: 330, y: 220, w: 28, h: 20 },
  { x: 10, y: 100, w: 18, h: 12 },
  { x: 280, y: 90, w: 15, h: 25 },
  { x: 170, y: 100, w: 20, h: 15 },
  { x: 380, y: 50, w: 15, h: 18 },
  { x: 50, y: 170, w: 15, h: 12 },
  { x: 310, y: 180, w: 18, h: 15 },
  { x: 230, y: 220, w: 22, h: 15 },
  { x: 120, y: 250, w: 18, h: 12 },
];

const INTERSECTIONS = [
  { x: 80, y: 80 },
  { x: 150, y: 120 },
  { x: 250, y: 120 },
  { x: 80, y: 180 },
  { x: 300, y: 120 },
  { x: 300, y: 185 },
  { x: 150, y: 235 },
  { x: 250, y: 235 },
];

export default function LocationMap({
  location = "Jos, Plateau State",
  coordinates = "9.9280° N, 8.8721° E",
  className = "",
}: LocationMapProps) {
  const [hovered, setHovered] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const ref = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  function handlePointerDown(e: React.PointerEvent) {
    ref.current = { x: e.clientX - panX, y: e.clientY - panY };
    setDragging(true);
    (e.target as SVGElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setPanX(e.clientX - ref.current.x);
    setPanY(e.clientY - ref.current.y);
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.target as SVGElement).releasePointerCapture(e.pointerId);
  }

  function handleWheel(e: React.WheelEvent) {
    // Future: zoom
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 400 300"
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{ transform: `translate(${panX}px, ${panY}px)` }}
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <filter id="roadGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mapShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        <rect width="400" height="300" fill="transparent" />

        <ellipse cx="200" cy="150" rx="180" ry="130" fill="url(#glow)" opacity="0.5" />

        {BUILDINGS.map((b, i) => (
          <motion.rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={3}
            fill={hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
          />
        ))}

        {ROADS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={hovered ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.25)"}
            strokeWidth={hovered ? 2.5 : 2}
            filter="url(#roadGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {INTERSECTIONS.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hovered ? 3 : 2}
            fill="rgba(16,185,129,0.4)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.02, duration: 0.2 }}
          />
        ))}

        <motion.circle
          cx={200}
          cy={150}
          r={8}
          fill="#10b981"
          opacity={0.3}
          animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={200}
          cy={150}
          r={5}
          fill="#10b981"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx={200} cy={150} r={3} fill="#fff" filter="url(#mapShadow)" />

        <motion.text
          x={200}
          y={30}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize="10"
          fontWeight="700"
          fontFamily="var(--font-display)"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {location}
        </motion.text>
        <motion.text
          x={200}
          y={44}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="8"
          fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {coordinates}
        </motion.text>

        {/* Panoramic landscape lines */}
        <motion.g
          opacity={0.08}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1 }}
        >
          <path d="M 0 280 Q 100 270 200 275 Q 300 280 400 270" fill="none" stroke="#fff" strokeWidth="1" />
          <path d="M 0 285 Q 150 278 250 282 Q 350 286 400 278" fill="none" stroke="#fff" strokeWidth="0.5" />
        </motion.g>
      </svg>

      <div
        className="absolute inset-0 flex items-end"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="w-full p-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none">
          <motion.p
            className="text-[10px] font-bold uppercase tracking-widest text-white/60"
            animate={{ opacity: hovered ? 0.4 : 0.8 }}
          >
            Drag to explore &bull; {coordinates}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
