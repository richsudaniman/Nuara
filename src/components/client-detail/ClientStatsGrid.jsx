import React from "react";
import { FileAudio, Target, TrendingUp, Award } from "lucide-react";

export default function ClientStatsGrid({ sessions = [], goals = [] }) {
  const metricValues = sessions.filter((s) => s.metric_value != null).map((s) => s.metric_value);
  const avg = metricValues.length
    ? Math.round(metricValues.reduce((a, b) => a + b, 0) / metricValues.length)
    : null;
  const best = metricValues.length ? Math.max(...metricValues) : null;

  const tiles = [
    { label: "Total submissions", value: sessions.length, icon: FileAudio, color: "bg-purple-50 text-purple-600" },
    { label: "Active goals", value: goals.length, icon: Target, color: "bg-emerald-50 text-emerald-600" },
    { label: "Avg metric", value: avg != null ? `${avg}%` : "—", icon: TrendingUp, color: "bg-sky-50 text-sky-600" },
    { label: "Best metric", value: best != null ? `${best}%` : "—", icon: Award, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div key={t.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${t.color}`}>
              <Icon className="w-4 h-4" strokeWidth={2.25} />
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{t.value}</p>
            <p className="text-[11px] text-gray-400 mt-1.5">{t.label}</p>
          </div>
        );
      })}
    </div>
  );
}