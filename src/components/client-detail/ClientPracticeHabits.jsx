import React from "react";
import { format, parseISO, differenceInCalendarDays, subDays } from "date-fns";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const toDate = (v) => (typeof v === "string" ? parseISO(v) : new Date(v));

export default function ClientPracticeHabits({ sessions = [] }) {
  const dated = sessions.map((s) => ({ ...s, _d: toDate(s.completed_date) })).filter((s) => s._d && !isNaN(s._d));

  const perWeekday = DAY_LABELS.map((label, i) => ({
    label,
    count: dated.filter((s) => (s._d.getDay() + 6) % 7 === i).length,
  }));
  const maxWeekday = Math.max(1, ...perWeekday.map((d) => d.count));
  const bestDay = perWeekday.reduce((a, d) => (d.count > a.count ? d : a), perWeekday[0]);

  const uniqueDays = [...new Set(dated.map((s) => format(s._d, "yyyy-MM-dd")))].sort();
  let longest = 0;
  let run = 0;
  uniqueDays.forEach((day, i) => {
    run = i > 0 && differenceInCalendarDays(parseISO(day), parseISO(uniqueDays[i - 1])) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  });

  const lastDate = uniqueDays.length ? parseISO(uniqueDays[uniqueDays.length - 1]) : null;
  const daysSince = lastDate ? differenceInCalendarDays(new Date(), lastDate) : null;
  const avgPerActiveDay = uniqueDays.length ? (dated.length / uniqueDays.length).toFixed(1) : "0";

  const strip = Array.from({ length: 28 }, (_, i) => {
    const d = subDays(new Date(), 27 - i);
    const key = format(d, "yyyy-MM-dd");
    return { key, day: format(d, "d"), count: dated.filter((s) => format(s._d, "yyyy-MM-dd") === key).length };
  });
  const activeIn28 = strip.filter((d) => d.count > 0).length;

  const facts = [
    { label: "Most active day", value: bestDay.count ? bestDay.label : "—" },
    { label: "Longest streak", value: longest ? `${longest} days` : "—" },
    { label: "Per active day", value: `${avgPerActiveDay} submissions` },
    {
      label: "Last practice",
      value: daysSince === null ? "—" : daysSince === 0 ? "Today" : `${daysSince} days ago`,
    },
    { label: "Active days (28d)", value: `${activeIn28} of 28` },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Practice habits</h2>
        <p className="text-sm text-gray-500 mt-0.5">When and how consistently this client practices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Facts list */}
        <dl className="divide-y divide-gray-100">
          {facts.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between py-2.5">
              <dt className="text-sm text-gray-500">{f.label}</dt>
              <dd className="text-sm font-semibold text-gray-900">{f.value}</dd>
            </div>
          ))}
        </dl>

        {/* Weekday distribution as horizontal bars */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">Sessions by day of week</p>
          <div className="space-y-1.5">
            {perWeekday.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-8 text-[11px] text-gray-400">{d.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.count === maxWeekday && d.count > 0 ? "bg-purple-500" : "bg-purple-300"}`}
                    style={{ width: `${(d.count / maxWeekday) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-right text-[11px] font-semibold text-gray-500">{d.count || "–"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 28-day calendar dots */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold text-gray-500">Last 4 weeks</p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-200" />
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
            <span>more</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 max-w-md">
          {strip.map((d) => (
            <div
              key={d.key}
              title={`${d.key} · ${d.count} submissions`}
              className={`aspect-square rounded-md ${
                d.count === 0 ? "bg-gray-100" : d.count === 1 ? "bg-purple-200" : d.count === 2 ? "bg-purple-400" : "bg-purple-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}