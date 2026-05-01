import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function CaseloadGoals({ clientId }) {
  const { data: goals = [] } = useQuery({
    queryKey: ["clientGoals", clientId],
    queryFn: async () => {
      try {
        const recovery = await base44.entities.RecoveryGoal.filter({ assigned_to_patient_id: clientId, is_active: true });
        if (recovery.length > 0) return recovery;
      } catch {}
      return base44.entities.FitnessGoal.filter({ assigned_to_client_id: clientId, is_active: true });
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });

  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Goals</h3>
        <p className="text-sm text-gray-400">No active goals set</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Goals</h3>
      <div className="space-y-3">
        {goals.map((goal) => {
          const pct = goal.progress_percentage || 0;
          const status = pct >= 80 ? "On track" : pct >= 50 ? "Monitor" : "Behind";
          const statusColor = pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-yellow-600" : "text-red-500";

          return (
            <div key={goal.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{goal.goal_title}</h4>
                <span className="text-lg font-bold text-purple-600 ml-3 flex-shrink-0">{pct}%</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {goal.current_value} → {goal.target_value}
              </p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-gray-400">
                Target: {goal.target_date ? format(new Date(goal.target_date), "MMM d, yyyy") : "—"} · <span className={statusColor}>{status}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}