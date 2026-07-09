"use client";

import { Line } from "react-chartjs-2";

interface Props {
  data: { date: string; count: number }[];
}

export default function PageViewsLine({ data }: Props) {
  return (
    <Line
      data={{
        labels: data.map(d => {
          const parts = d.date.split("-");
          return `${parts[1]}/${parts[2]}`;
        }),
        datasets: [{
          label: "Page Views",
          data: data.map(d => d.count),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: "#f59e0b",
          borderWidth: 2,
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
          },
        },
      }}
      height={260}
    />
  );
}
