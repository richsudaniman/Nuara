import React from "react";

export default function ComplianceTrendPanel({ currentCompliance, weeklyData }) {
  const maxVal = Math.max(...weeklyData.map(w => w.value), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Practice-Wide Compliance Trend</h3>
      <p className="text-4xl font-bold text-gray-900">{currentCompliance}%</p>
      <div className="mt-4">
        <div className="flex items-end gap-1.5 h-16">
          {weeklyData.map((w, idx) => {
            const isLast = idx === weeklyData.length - 1;
            const height = maxVal > 0 ? (w.value / maxVal) * 100 : 0;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-sm transition-all ${isLast ? "bg-purple-600" : "bg-purple-300"}`}
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-1.5">
          {weeklyData.map((w, idx) => {
            const isLast = idx === weeklyData.length - 1;
            return (
              <span key={idx} className={`flex-1 text-center text-[9px] ${isLast ? "font-bold text-gray-700" : "text-gray-400"}`}>
                {w.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}