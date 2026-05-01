import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { subDays, startOfWeek } from "date-fns";

export default function CaseloadCompliance({ clientId }) {
  const { data: logs = [] } = useQuery({
    queryKey: ["clientLogs", clientId],
    queryFn: () => base44.entities.WorkoutLog.filter({ logged_by_client_id: clientId }, "-completed_date", 200),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  });

  // This week compliance
  const sevenDaysAgo = subDays(new Date(), 7);
  const thisWeekLogs = logs.filter((l) => new Date(l.completed_date) >= sevenDaysAgo);
  const activeDays = new Set(thisWeekLogs.map((l) => l.completed_date)).size;
  const compliance = Math.min(Math.round((activeDays / 7) * 100), 100);

  // Streak
  const sortedDates = [...new Set(logs.map((l) => l.completed_date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = subDays(today, i).toISOString().split("T")[0];
    if (sortedDates.includes(checkDate)) {
      streak++;
    } else if (i > 0) break;
  }

  // Weekly breakdown (last 4 weeks)
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = subDays(new Date(), (3 - i) * 7 + 7);
    const weekEnd = subDays(new Date(), (3 - i) * 7);
    const weekLogs = logs.filter((l) => {
      const d = new Date(l.completed_date);
      return d >= weekStart && d < weekEnd;
    });
    const days = new Set(weekLogs.map((l) => l.completed_date)).size;
    return { label: `W${i + 1}`, pct: Math.min(Math.round((days / 7) * 100), 100) };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Compliance this week</h3>

      <div className="text-center mb-4">
        <span className="text-4xl font-bold text-purple-600">{compliance}%</span>
        <p className="text-xs text-gray-400 mt-1">
          {activeDays} / 7 days active · Streak: {streak} days
        </p>
      </div>

      <div className="space-y-2">
        {weeklyData.map((w) => (
          <div key={w.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">{w.label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${w.pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 w-8 text-right">{w.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}