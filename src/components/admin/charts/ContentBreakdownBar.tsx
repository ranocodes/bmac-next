"use client";

import { Bar } from "react-chartjs-2";

interface Props {
  data: { label: string; count: number }[];
}

export default function ContentBreakdownBar({ data }: Props) {
  return (
    <Bar
      data={{
        labels: data.map(d => d.label),
        datasets: [{
          label: "Items",
          data: data.map(d => d.count),
          backgroundColor: [
            "rgba(245, 158, 11, 0.7)",
            "rgba(59, 130, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(139, 92, 246, 0.7)",
            "rgba(236, 72, 153, 0.7)",
            "rgba(249, 115, 22, 0.7)",
          ],
          borderRadius: 6,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#888" },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: { font: { size: 11 }, color: "#888", stepSize: 1 },
            beginAtZero: true,
          },
        },
      }}
      height={260}
    />
  );
}
