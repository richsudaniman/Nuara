import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Mic, BookOpen, Send, CheckCircle } from "lucide-react";

const EXERCISE_ICONS = {
  sound: Mic,
  sentence: BookOpen,
  story: Send,
};

function getIcon(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("sound") || lower.includes("drill") || lower.includes("/r/") || lower.includes("/s/")) return Mic;
  if (lower.includes("sentence") || lower.includes("builder")) return BookOpen;
  if (lower.includes("story") || lower.includes("retelling")) return Send;
  return BookOpen;
}

export default function CaseloadHomework({ clientId }) {
  const { data: plans = [] } = useQuery({
    queryKey: ["clientWorkoutPlans", clientId],
    queryFn: async () => {
      try {
        const rehab = await base44.entities.RehabilitationProgram.filter({ assigned_to_patient_id: clientId });
        if (rehab.length > 0) return rehab;
      } catch {}
      return base44.entities.WorkoutPlan.filter({ assigned_to_client_id: clientId });
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["clientLogs", clientId],
    queryFn: () => base44.entities.WorkoutLog.filter({ logged_by_client_id: clientId }, "-completed_date", 100),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  });

  // Group plans into day ranges
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedPlans = [...plans].sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));

  // Group consecutive days
  const groups = [];
  let current = null;
  sortedPlans.forEach((plan) => {
    const idx = dayOrder.indexOf(plan.day_of_week);
    if (current && idx === current.endIdx + 1) {
      current.endIdx = idx;
      current.endDay = plan.day_of_week;
      current.plans.push(plan);
    } else {
      current = { startDay: plan.day_of_week, endDay: plan.day_of_week, startIdx: idx, endIdx: idx, plans: [plan] };
      groups.push(current);
    }
  });

  const todayDate = new Date().toISOString().split("T")[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">This week's homework</h3>
        <p className="text-sm text-gray-400">No homework assigned</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">This week's homework</h3>

      <div className="space-y-4">
        {groups.map((group, gIdx) => {
          const allExercises = group.plans.flatMap((p) => p.exercises || []);
          const completedCount = allExercises.filter((ex) =>
            logs.some(
              (l) => l.exercise_name === ex.name && new Date(l.completed_date) >= thisWeekStart
            )
          ).length;
          const allDone = completedCount === allExercises.length && allExercises.length > 0;

          const rangeLabel =
            group.startDay === group.endDay
              ? group.startDay
              : `${group.startDay} – ${group.endDay}`;

          return (
            <div key={gIdx} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{rangeLabel}</h4>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    allDone
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {allDone ? "Completed" : `${completedCount} / ${allExercises.length} done`}
                </span>
              </div>

              <div className="space-y-2.5">
                {allExercises.slice(0, 4).map((ex, eIdx) => {
                  const Icon = getIcon(ex.name);
                  const isCompleted = logs.some(
                    (l) => l.exercise_name === ex.name && new Date(l.completed_date) >= thisWeekStart
                  );
                  const level = ex.notes?.toLowerCase().includes("word") ? "Word level"
                    : ex.notes?.toLowerCase().includes("sentence") ? "Sentence level"
                    : ex.notes?.toLowerCase().includes("record") ? "Record + submit"
                    : "";

                  return (
                    <div key={eIdx} className="flex items-start gap-3 pl-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCompleted ? "bg-emerald-100" : "bg-purple-100"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Icon className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                        <p className="text-xs text-gray-400">
                          Repeat {ex.reps || ex.sets || 1} time{(ex.reps || ex.sets || 1) > 1 ? "s" : ""}
                          {level ? ` · ${level}` : ""}
                        </p>
                      </div>
                      {!isCompleted && (
                        <span className="text-xs font-semibold text-orange-500 px-2 py-0.5 bg-orange-50 rounded-full flex-shrink-0">
                          Pending
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-semibold text-purple-600 flex-shrink-0">
                          +{(ex.reps || 5) > 10 ? 15 : 10} pts
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}