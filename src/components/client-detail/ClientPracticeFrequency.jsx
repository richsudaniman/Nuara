import React from "react";
import { format, subDays, isSameDay, parseISO } from "date-fns";

const TARGET_DAYS = 5;

function toDate(v) {
  try {
    return typeof v === "string" ? parseISO(v) : new Date(v);
  } catch {
    return null;
  }
}

export default function ClientPracticeFrequency({ sessions = [] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const dayHasPractice = days.map((d) =>
    sessions.some((s) => {
      const sd = toDate(s.completed_date);
      return sd && isSameDay(sd, d);
    })
  );

  const daysPracticed = dayHasPractice.filter(Boolean).length;
  const compliance = Math.min(Math.round((daysPracticed / TARGET_DAYS) * 100), 100);

  // Current streak counted backwards from today
  let streak = 0;
  for (let i = dayHasPractice.length - 1; i >= 0; i--) {
    if (dayHasPractice[i]) streak++;
    else break;
  }

  const uniqueDaysAllTime = new Set(sessions.map((s) => s.completed_date)).size;

  const complianceColor =
    compliance >= 75 ? "text-emerald-600" : compliance >= 50 ? "text-yellow-600" : "text-orange-500";
  const barColor =
    compliance >= 75 ? "bg-emerald-500" : compliance >= 50 ? "bg-yellow-500" : "bg-orange-400";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Practice frequency</h2>
          <p className="text-sm text-gray-500 mt-0.5">Last 7 days · target {TARGET_DAYS} days/week</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${complianceColor} leading-none`}>{compliance}%</p>
          <p className="text-[11px] text-gray-400 mt-1">weekly compliance</p>
        </div>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${compliance}%` }} />
      </div>

      <div className="flex gap-2 mb-6">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`w-full h-12 rounded-lg border transition-colors ${
                dayHasPractice[i] ? "bg-purple-500 border-purple-500" : "bg-gray-50 border-gray-200"
              }`}
            />
            <span className="text-[10px] font-semibold text-gray-400">{format(d, "EEE")[0]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-100">
        <div>
          <p className="text-xl font-bold text-gray-900">{daysPracticed}<span className="text-sm text-gray-400 font-medium">/{TARGET_DAYS}</span></p>
          <p className="text-[11px] text-gray-400 mt-0.5">days this week</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{streak}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">day streak</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{uniqueDaysAllTime}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">total practice days</p>
        </div>
      </div>
    </div>
  );
}