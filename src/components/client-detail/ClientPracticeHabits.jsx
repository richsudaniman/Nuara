import React from "react";
import { format, parseISO, differenceInCalendarDays, subDays } from "date-fns";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const toDate = (v) => (typeof v === "string" ? parseISO(v) : new Date(v));

export default function ClientPracticeHabits({ sessions = [] }) {
  const dated = sessions.map((s) => ({ ...s, _d: toDate(s.completed_date) })).filter((s) => s._d && !isNaN(s._d));

  // Sessions per weekday (Mon-first)
  const perWeekday = DAY_LABELS.map((label, i) => {
    const count = dated.filter((s) => (s._d.getDay() + 6) % 7 === i).length;
    return { label, count };
  });
  const maxWeekday = Math.max(1, ...perWeekday.map((d) => d.count));
  const bestDay = perWeekday.reduce((a, d) => (d.count > a.count ? d : a), perWeekday[0]);

  // Longest streak across all recorded days
  const uniqueDays = [...new Set(dated.map((s) => format(s._d, "yyyy-MM-dd")))].sort();
  let longest = 0;
  let run = 0;
  uniqueDays.forEach((day, i) => {
    if (i > 0 && differenceInCalendarDays(parseISO(day), parseISO(uniqueDays[i - 1])) === 1) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  });

  const lastDate = uniqueDays.length ? parseISO(uniqueDays[uniqueDays.length - 1]) : null;
  const daysSince = lastDate ? differenceInCalendarDays(new Date(), lastDate) : null;
  const avgPerActiveDay = uniqueDays.length ? (dated.length / uniqueDays.length).toFixed(1) : "0";
  const totalReps = dated.reduce((a, s) => a + (s.reps_completed || 0) * (s.sets_completed || 1), 0);

  // 28-day consistency strip
  const strip = Array.from({ length: 28 }, (_, i) => {
    const d = subDays(new Date(), 27 - i);
    const key = format(d, "yyyy-MM-dd");
    return { key, count: dated.filter((s) => format(s._d, "yyyy-MM-dd") === key).length };
  });
  const activeIn28 = strip.filter((d) => d.count > 0).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">Practice habits</h2>
        <p className="text-sm text-gray-500 mt-0.5">When and how consistently this client practices</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xl font-bold text-gray-900">{bestDay.count ? bestDay.label : "—"}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">most active day</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{longest}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">longest streak (days)</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{avgPerActiveDay}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">submissions per active day</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{daysSince === null ? "—" : daysSince === 0 ? "Today" : `${daysSince}d`}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">since last practice</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Sessions by day of week</p>
        <div className="flex items-end gap-2 h-24">
          {perWeekday.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-semibold text-gray-500">{d.count || ""}</span>
              <div
                className={`w-full rounded-t-md ${d.count === maxWeekday && d.count > 0 ? "bg-purple-500" : "bg-purple-200"}`}
                style={{ height: `${Math.max((d.count / maxWeekday) * 100, 3)}%` }}
              />
              <span className="text-[10px] text-gray-400">{d.label[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">Last 28 days</p>
          <p className="text-[11px] text-gray-400">{activeIn28} active days · {totalReps} total reps</p>
        </div>
        <div className="flex gap-1">
          {strip.map((d) => (
            <div
              key={d.key}
              title={`${d.key} · ${d.count} submissions`}
              className={`flex-1 h-6 rounded-sm ${
                d.count === 0 ? "bg-gray-100" : d.count === 1 ? "bg-purple-200" : d.count === 2 ? "bg-purple-400" : "bg-purple-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}