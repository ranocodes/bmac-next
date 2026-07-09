"use client";

import { Bar } from "react-chartjs-2";

interface Props {
  data: { path: string; count: number }[];
}

export default function TopPagesBar({ data }: Props) {
  return (
    <Bar
      data={{
        labels: data.map(d => d.path),
        datasets: [{
          label: "Visits",
          data: data.map(d => d.count),
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderRadius: 6,
          borderSkipped: false,
        }],
      }}
      options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: { font: { size: 11 }, color: "#888", stepSize: 1 },
            beginAtZero: true,
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              color: "#555",
            },
          },
        },
      }}
      height={260}
    />
  );
}
