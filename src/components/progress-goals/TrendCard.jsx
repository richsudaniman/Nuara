import React from "react";

export default function TrendCard({ title, weeks, footer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 leading-relaxed">
        {title}
      </h3>
      <div className="space-y-2.5">
        {weeks.map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-8">{w.label}</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${w.value}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-10 text-right">{w.value}%</span>
          </div>
        ))}
      </div>
      {footer && <p className="text-xs text-gray-400 mt-4">{footer}</p>}
    </div>
  );
}