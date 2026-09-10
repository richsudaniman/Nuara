import React from "react";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { demoGamePlays, DEMO_GAMES } from "@/lib/demoGamePlays";

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

export default function ClientGameAnalytics({ plays = demoGamePlays }) {
  const rows = DEMO_GAMES.map((g) => {
    const gamePlays = plays.filter((p) => p.game_id === g.id);
    const times = gamePlays.map((p) => p.duration_seconds);
    const first = avg(times.slice(0, 3));
    const last = avg(times.slice(-3));
    const deltaSec = Math.round(first - last);
    const last14 = gamePlays.filter((p) => differenceInCalendarDays(new Date(), parseISO(p.played_date)) <= 14).length;
    return {
      ...g,
      plays: gamePlays.length,
      last14,
      accuracy: Math.round(avg(gamePlays.map((p) => p.accuracy))),
      currentTime: times.length ? Math.round(last) : null,
      deltaSec,
      spark: times.map((t, i) => ({ i, t })),
      status: deltaSec >= 3 ? "improving" : deltaSec <= -3 ? "slower" : "steady",
    };
  });

  const totalLast14 = rows.reduce((s, r) => s + r.last14, 0);
  const improving = rows.filter((r) => r.status === "improving").length;

  const STATUS = {
    improving: { label: "Improving", cls: "bg-emerald-50 text-emerald-700", Icon: ArrowDown, line: "#10b981" },
    slower: { label: "Slipping", cls: "bg-orange-50 text-orange-700", Icon: ArrowUp, line: "#f97316" },
    steady: { label: "Plateaued", cls: "bg-gray-100 text-gray-600", Icon: Minus, line: "#9CA3AF" },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Practice games</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {totalLast14} plays in the last 2 weeks · {improving} of {rows.length} games getting faster
        </p>
      </div>

      {/* Column headers */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        <div className="col-span-4">Game</div>
        <div className="col-span-2">Plays (2 wks)</div>
        <div className="col-span-2">Avg time now</div>
        <div className="col-span-2">Trend</div>
        <div className="col-span-2 text-right">Accuracy</div>
      </div>

      <div className="divide-y divide-gray-100">
        {rows.map((r) => {
          const s = STATUS[r.status];
          return (
            <div key={r.id} className="grid grid-cols-2 md:grid-cols-12 gap-4 items-center px-3 py-4">
              <div className="col-span-2 md:col-span-4 flex items-center gap-2.5">
                <span className="text-lg">{r.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</p>
                  <p className="text-[11px] text-gray-400">{r.plays} plays total</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-bold text-gray-900">{r.last14}</p>
                <p className="text-[11px] text-gray-400">{r.last14 >= 3 ? "on track" : "below target"}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-bold text-gray-900">{r.currentTime}s</p>
                <p className="text-[11px] text-gray-400">
                  {r.deltaSec > 0 ? `${r.deltaSec}s faster` : r.deltaSec < 0 ? `${Math.abs(r.deltaSec)}s slower` : "no change"}
                </p>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <div className="w-14 h-7">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={r.spark}>
                      <Line type="monotone" dataKey="t" stroke={s.line} strokeWidth={1.75} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${s.cls}`}>
                  <s.Icon className="w-3 h-3" />
                  {s.label}
                </span>
              </div>

              <div className="md:col-span-2 md:text-right">
                <p className="text-sm font-bold text-gray-900">{r.accuracy}%</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
        "Avg time now" is the average of the last 3 plays; a shorter time means faster, more automatic responses.
      </p>
    </div>
  );
}