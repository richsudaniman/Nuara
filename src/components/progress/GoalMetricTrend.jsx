import React from "react";

// Shows the last N session metric values for a goal as a mini trend.
// props: goal, sessions (array of { completed_date, metric_value, session_label })
export default function GoalMetricTrend({ goal, sessions = [] }) {
  const unit = goal?.unit || "%";
  const target = goal?.target_metric_value;
  const last = [...sessions]
    .filter((s) => s.metric_value != null)
    .sort((a, b) => (a.completed_date < b.completed_date ? -1 : 1))
    .slice(-3);

  const values = last.map((s) => s.metric_value);
  const latest = values[values.length - 1];
  const prev = values[values.length - 2];
  const delta = latest != null && prev != null ? latest - prev : null;

  return (
    <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em]">
            {goal?.metric_label || goal?.goal_title || "Metric"}
          </p>
          <h3 className="text-[15px] font-semibold text-[#0F0F12] leading-tight mt-0.5">
            {goal?.goal_title}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[20px] font-bold text-[#A78BFA] leading-none">
            {latest != null ? `${latest}${unit === "%" ? "%" : ""}` : "—"}
          </p>
          {delta != null && (
            <p className={`text-[11px] font-semibold mt-1 ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}{unit === "%" ? "%" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="h-24 mb-2">
        {values.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF]">No session data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-full">
            {values.map((v, i) => {
              const scale = target || Math.max(...values, 1);
              const pct = Math.max(8, Math.min(100, Math.round((v / scale) * 100)));
              return (
                <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                  <div className="w-full flex-1 flex items-end bg-[#F1F1F4] rounded-md overflow-hidden">
                    <div className="w-full bg-[#A78BFA] rounded-md" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B6B75]">{v}{unit === "%" ? "%" : ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
        <span>Last {values.length || 0} session{values.length === 1 ? "" : "s"}</span>
        {target != null && <span>Target: {target}{unit === "%" ? "%" : ` ${unit}`}</span>}
      </div>
    </div>
  );
}