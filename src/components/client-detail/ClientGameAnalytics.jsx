import React from "react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { demoGamePlays, DEMO_GAMES } from "@/lib/demoGamePlays";

const COLORS = ["#A78BFA", "#10b981", "#f59e0b"];

// Faster completion time = improvement. Compare first 3 vs last 3 plays.
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

export default function ClientGameAnalytics({ plays = demoGamePlays }) {
  const byGame = DEMO_GAMES.map((g, i) => {
    const gamePlays = plays.filter((p) => p.game_id === g.id);
    const times = gamePlays.map((p) => p.duration_seconds);
    const first = avg(times.slice(0, 3));
    const last = avg(times.slice(-3));
    const deltaPct = first ? Math.round(((first - last) / first) * 100) : 0;
    return {
      ...g,
      color: COLORS[i % COLORS.length],
      plays: gamePlays.length,
      bestTime: times.length ? Math.min(...times) : null,
      lastTime: times.length ? times[times.length - 1] : null,
      accuracy: Math.round(avg(gamePlays.map((p) => p.accuracy))),
      deltaPct,
    };
  });

  const last30 = plays.filter((p) => differenceInCalendarDays(new Date(), parseISO(p.played_date)) <= 30);
  const lastPlay = plays.length ? plays[plays.length - 1] : null;
  const daysSince = lastPlay ? differenceInCalendarDays(new Date(), parseISO(lastPlay.played_date)) : null;

  // Chart: one series per game, time in seconds by play date
  const dates = [...new Set(plays.map((p) => p.played_date))].sort();
  const chartData = dates.map((date) => {
    const row = { date: format(parseISO(date), "MMM d") };
    plays.filter((p) => p.played_date === date).forEach((p) => {
      row[p.game_title] = p.duration_seconds;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Practice games</h2>
          <p className="text-sm text-gray-500 mt-0.5">How often games are played and whether times are improving</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 leading-none">{last30.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">plays in 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {byGame.map((g) => {
          const improving = g.deltaPct > 3;
          const slower = g.deltaPct < -3;
          const Icon = improving ? TrendingUp : slower ? TrendingDown : Minus;
          return (
            <div key={g.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/60">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{g.emoji}</span>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{g.title}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-gray-900">{g.lastTime}s</p>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    improving ? "text-emerald-600" : slower ? "text-orange-600" : "text-gray-400"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {improving ? `${g.deltaPct}% faster` : slower ? `${Math.abs(g.deltaPct)}% slower` : "steady"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {g.plays} plays · best {g.bestTime}s · {g.accuracy}% accuracy
              </p>
            </div>
          );
        })}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "sec", angle: -90, position: "insideLeft", fontSize: 10, fill: "#9CA3AF" }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
              formatter={(v) => [`${v}s`, "completion time"]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
            {byGame.map((g) => (
              <Line
                key={g.id}
                type="monotone"
                dataKey={g.title}
                stroke={g.color}
                strokeWidth={2}
                dot={{ r: 2.5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
        Lower completion times indicate faster, more automatic responses.
        {daysSince !== null && ` Last game played ${daysSince === 0 ? "today" : `${daysSince} days ago`}.`}
      </p>
    </div>
  );
}