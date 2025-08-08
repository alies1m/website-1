"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SubjectPerformanceChart({ data }) {
  const labels = data.map(d => d.subject_name);
  const avg = data.map(d => Math.round((d.avg_ratio || 0) * 100));
  const attempts = data.map(d => d.attempts_count || 0);
  const dataset = {
    labels,
    datasets: [
      { label: "Average %", data: avg, backgroundColor: "#3b82f6" },
      { label: "Attempts", data: attempts, backgroundColor: "#94a3b8" },
    ],
  };
  return (
    <div className="border rounded-lg p-4">
      <Bar data={dataset} options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Performance by Subject" } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
    </div>
  );
}