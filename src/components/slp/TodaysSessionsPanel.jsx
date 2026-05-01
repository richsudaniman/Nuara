import React from "react";

const TAG_STYLES = {
  soon: "bg-purple-100 text-purple-700",
  afternoon: "bg-gray-100 text-gray-600",
  prep: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-500",
};

export default function TodaysSessionsPanel({ sessions }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Today's Sessions</h3>
      {(!sessions || sessions.length === 0) ? (
        <p className="text-sm text-gray-400 text-center py-4">No sessions scheduled today</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s, idx) => {
            const tagStyle = TAG_STYLES[s.tagType] || TAG_STYLES.default;
            return (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-400 w-12 flex-shrink-0 pt-0.5">{s.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{s.clientName}</p>
                  <p className="text-xs text-gray-500">{s.sessionType}</p>
                </div>
                {s.tag && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${tagStyle}`}>
                    {s.tag}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}