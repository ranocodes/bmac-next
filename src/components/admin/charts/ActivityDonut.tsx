"use client";

import { Doughnut } from "react-chartjs-2";

interface Props {
  data: { action: string; count: number }[];
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#84cc16"];

export default function ActivityDonut({ data }: Props) {
  return (
    <Doughnut
      data={{
        labels: data.map(d => d.action),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: COLORS.slice(0, data.length),
          borderWidth: 0,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 14, usePointStyle: true, font: { size: 11 }, color: "#555" },
          },
        },
      }}
      height={280}
    />
  );
}
