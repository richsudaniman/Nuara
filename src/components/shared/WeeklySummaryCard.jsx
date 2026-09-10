import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Activity, CalendarCheck, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function last7Range() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
}
function prev7Range() {
  const end = new Date();
  end.setDate(end.getDate() - 7);
  const start = new Date();
  start.setDate(start.getDate() - 13);
  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
}

// Computes a weekly summary (progress, frequency, consistency, engagement) from TherapyLog.
export default function WeeklySummaryCard({ clientId, title = "Weekly summary" }) {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const targetId = clientId || user?.id;

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["weeklySummaryLogs", targetId],
    queryFn: () =>
      base44.entities.TherapyLog.filter({ logged_by_client_id: targetId }, "-completed_date", 300),
    enabled: !!targetId,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5 space-y-4">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const { start, end } = last7Range();
  const { start: pStart, end: pEnd } = prev7Range();

  const thisWeek = logs.filter((l) => l.completed_date >= start && l.completed_date <= end);
  const prevWeek = logs.filter((l) => l.completed_date >= pStart && l.completed_date <= pEnd);

  const avg = (arr) =>
    arr.length ? Math.round(arr.reduce((s, l) => s + (l.metric_value || 0), 0) / arr.length) : null;
  const thisAvg = avg(thisWeek.filter((l) => l.metric_value != null));
  const prevAvg = avg(prevWeek.filter((l) => l.metric_value != null));

  const frequency = thisWeek.length;
  const practiceDays = new Set(thisWeek.map((l) => l.completed_date)).size;
  const consistency = `${practiceDays}/5`;
  const engagement = Math.min(Math.round((practiceDays / 5) * 100), 100);

  const delta = thisAvg != null && prevAvg != null ? thisAvg - prevAvg : null;

  const tiles = [
    {
      icon: TrendingUp,
      label: "Progress",
      value: thisAvg != null ? `${thisAvg}%` : "—",
      sub: delta != null ? (delta >= 0 ? `▲ ${delta}% vs last wk` : `▼ ${Math.abs(delta)}% vs last wk`) : "avg accuracy",
      tone: "text-emerald-600",
    },
    { icon: Activity, label: "Frequency", value: frequency, sub: "submissions this wk", tone: "text-purple-600" },
    { icon: CalendarCheck, label: "Consistency", value: consistency, sub: "practice days", tone: "text-sky-600" },
    { icon: Flame, label: "Engagement", value: `${engagement}%`, sub: "of weekly target", tone: "text-orange-600" },
  ];

  return (
    <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#0F0F12]">{title}</h3>
        <span className="text-[11px] text-[#9CA3AF]">{start} → {end}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="rounded-xl bg-[#FAFAFB] border border-[#EFEFF2] p-3.5">
              <Icon className={`w-4 h-4 mb-2 ${t.tone}`} strokeWidth={2.25} />
              <p className="text-[22px] font-bold text-[#0F0F12] leading-none">{t.value}</p>
              <p className="text-[11px] font-semibold text-[#6B6B75] mt-1.5">{t.label}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">{t.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}