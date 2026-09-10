import React from "react";
import { format, startOfWeek, subWeeks, isSameWeek, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, Cell } from "recharts";

const TARGET_DAYS = 5;
const WEEKS = 8;

const toDate = (v) => (typeof v === "string" ? parseISO(v) : new Date(v));

export default function ClientPracticeTrend({ sessions = [] }) {
  const today = new Date();
  const weeks = Array.from({ length: WEEKS }, (_, i) => startOfWeek(subWeeks(today, WEEKS - 1 - i), { weekStartsOn: 1 }));

  const data = weeks.map((w) => {
    const inWeek = sessions.filter((s) => {
      const d = toDate(s.completed_date);
      return d && isSameWeek(d, w, { weekStartsOn: 1 });
    });
    const uniqueDays = new Set(inWeek.map((s) => format(toDate(s.completed_date), "yyyy-MM-dd"))).size;
    return { label: format(w, "MMM d"), days: uniqueDays, sessions: inWeek.length };
  });

  const avgDays = data.length ? (data.reduce((a, d) => a + d.days, 0) / data.length).toFixed(1) : 0;
  const best = data.reduce((a, d) => (d.days > a.days ? d : a), data[0] || { days: 0, label: "—" });
  const weeksOnTarget = data.filter((d) => d.days >= TARGET_DAYS).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Practice trend</h2>
          <p className="text-sm text-gray-500 mt-0.5">Days practiced per week · last {WEEKS} weeks</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 leading-none">{avgDays}</p>
          <p className="text-[11px] text-gray-400 mt-1">avg days/week</p>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 7]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
              formatter={(v, n) => [v, n === "days" ? "days practiced" : n]}
            />
            <ReferenceLine y={TARGET_DAYS} stroke="#A78BFA" strokeDasharray="4 4" />
            <Bar dataKey="days" radius={[6, 6, 0, 0]} barSize={22}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.days >= TARGET_DAYS ? "#10b981" : d.days >= 3 ? "#A78BFA" : "#E5E7EB"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-5 mt-2 border-t border-gray-100">
        <div>
          <p className="text-xl font-bold text-gray-900">{weeksOnTarget}<span className="text-sm text-gray-400 font-medium">/{WEEKS}</span></p>
          <p className="text-[11px] text-gray-400 mt-0.5">weeks on target</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{best.days}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">best week ({best.label})</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{data.reduce((a, d) => a + d.sessions, 0)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">submissions in {WEEKS} weeks</p>
        </div>
      </div>
    </div>
  );
}