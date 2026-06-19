import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Mic, BookOpen, Send, CheckCircle } from "lucide-react";

const DEMO_GROUPS = [
  {
    range: "Monday – Wednesday",
    status: "completed",
    statusLabel: "Completed",
    exercises: [
      { name: "Sound drill — /r/ words", reps: 20, level: "Word level", points: 10, icon: Mic, completed: true },
      { name: "Sentence builder — level 3", reps: 5, level: "Sentence level", points: 15, icon: BookOpen, completed: true },
    ],
  },
  {
    range: "Thursday – Friday",
    status: "partial",
    statusLabel: "2 / 3 done",
    exercises: [
      { name: "Story retelling", reps: 1, level: "Record + submit", points: null, icon: Send, completed: false, pending: true },
    ],
  },
];

function getIcon(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("sound") || lower.includes("drill") || lower.includes("/r/") || lower.includes("/s/")) return Mic;
  if (lower.includes("sentence") || lower.includes("builder")) return BookOpen;
  if (lower.includes("story") || lower.includes("retelling")) return Send;
  return BookOpen;
}

export default function CaseloadHomework({ clientId, isDemo }) {
  const { data: plans = [] } = useQuery({
    queryKey: ["clientWorkoutPlans", clientId],
    queryFn: async () => {
      try {
        const rehab = await base44.entities.CareProgram.filter({ assigned_to_patient_id: clientId });
        if (rehab.length > 0) return rehab;
      } catch {}
      return base44.entities.TherapyPlan.filter({ assigned_to_client_id: clientId });
    },
    enabled: !!clientId && !isDemo,
    staleTime: 5 * 60 * 1000,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["clientLogs", clientId],
    queryFn: () => base44.entities.TherapyLog.filter({ logged_by_client_id: clientId }, "-completed_date", 100),
    enabled: !!clientId && !isDemo,
    staleTime: 2 * 60 * 1000,
  });

  const useDemo = isDemo || plans.length === 0;

  let groups = [];
  if (useDemo) {
    groups = DEMO_GROUPS;
  } else {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const sortedPlans = [...plans].sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const rawGroups = [];
    let current = null;
    sortedPlans.forEach((plan) => {
      const idx = dayOrder.indexOf(plan.day_of_week);
      if (current && idx === current.endIdx + 1) {
        current.endIdx = idx;
        current.endDay = plan.day_of_week;
        current.plans.push(plan);
      } else {
        current = { startDay: plan.day_of_week, endDay: plan.day_of_week, startIdx: idx, endIdx: idx, plans: [plan] };
        rawGroups.push(current);
      }
    });

    groups = rawGroups.map((group) => {
      const allExercises = group.plans.flatMap((p) => p.exercises || []);
      const exercisesWithStatus = allExercises.map((ex) => {
        const completed = logs.some(
          (l) => l.exercise_name === ex.name && new Date(l.completed_date) >= thisWeekStart
        );
        const level = ex.notes?.toLowerCase().includes("word") ? "Word level"
          : ex.notes?.toLowerCase().includes("sentence") ? "Sentence level"
          : ex.notes?.toLowerCase().includes("record") ? "Record + submit"
          : "";
        return {
          name: ex.name,
          reps: ex.reps || ex.sets || 1,
          level,
          icon: getIcon(ex.name),
          completed,
          points: completed ? ((ex.reps || 5) > 10 ? 15 : 10) : null,
          pending: !completed,
        };
      });
      const completedCount = exercisesWithStatus.filter((e) => e.completed).length;
      const total = exercisesWithStatus.length;
      const allDone = completedCount === total && total > 0;

      return {
        range: group.startDay === group.endDay ? group.startDay : `${group.startDay} – ${group.endDay}`,
        status: allDone ? "completed" : "partial",
        statusLabel: allDone ? "Completed" : `${completedCount} / ${total} done`,
        exercises: exercisesWithStatus,
      };
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">This week's homework</h3>

      <div className="space-y-4">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">{group.range}</h4>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  group.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {group.statusLabel}
              </span>
            </div>

            <div className="space-y-3">
              {group.exercises.slice(0, 4).map((ex, eIdx) => {
                const Icon = ex.icon || BookOpen;
                return (
                  <div key={eIdx} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      ex.completed ? "bg-emerald-50" : "bg-purple-50"
                    }`}>
                      {ex.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Icon className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Repeat {ex.reps} time{ex.reps > 1 ? "s" : ""}
                        {ex.level ? ` · ${ex.level}` : ""}
                      </p>
                    </div>
                    {ex.points && (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full flex-shrink-0">
                        +{ex.points} pts
                      </span>
                    )}
                    {ex.pending && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex-shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}