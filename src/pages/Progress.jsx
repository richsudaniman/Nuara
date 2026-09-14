import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressHero from "@/components/progress/ProgressHero";
import GoalMetricTrend from "@/components/progress/GoalMetricTrend";
import SubmittedWorkFeed from "@/components/progress/SubmittedWorkFeed";
import { demoGoals, demoLogs } from "@/lib/demoProgressData";

export default function Progress() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: realGoals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["myTherapyGoals", user?.id],
    queryFn: () =>
      base44.entities.TherapyGoal.filter({ assigned_to_client_id: user.id, is_active: true }),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const { data: realLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["myTherapyLogs", user?.id],
    queryFn: () =>
      base44.entities.TherapyLog.filter({ logged_by_client_id: user.id }, "-completed_date", 300),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const isLoading = goalsLoading || logsLoading;

  // Demo fallback so the page shows meaningful progress before real data exists
  const hasRealData = realGoals.length > 0 && realLogs.length > 0;
  const goals = hasRealData ? realGoals : demoGoals;
  const logs = hasRealData ? realLogs : demoLogs;

  const last7 = new Date();
  last7.setDate(last7.getDate() - 7);
  const practiceDays = new Set(
    logs.filter((l) => new Date(l.completed_date) >= last7).map((l) => l.completed_date)
  ).size;

  const scored = logs.filter((l) => typeof l.metric_value === "number");
  const avgAccuracy = scored.length
    ? Math.round(scored.reduce((s, l) => s + l.metric_value, 0) / scored.length)
    : null;

  // Sessions tied to a goal (by goal_id or metric_type match)
  const sessionsForGoal = (g) =>
    logs.filter(
      (s) =>
        s.metric_value != null &&
        (s.goal_id === g.id || s.metric_type === g.metric_type || s.metric_type === g.linked_metric_type)
    );

  const workForGoal = (g) =>
    logs.filter(
      (s) => s.goal_id === g.id || s.metric_type === g.metric_type || s.metric_type === g.linked_metric_type
    );

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-5 py-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-[26px] font-bold text-[#0F0F12] tracking-tight leading-tight">My Progress 🌟</h1>
        <p className="text-[14px] text-[#6B6B75]">Look how far you've come!</p>
      </div>

      <ProgressHero
        practiceDays={practiceDays}
        totalSubmissions={logs.length}
        activeGoals={goals.length}
        avgAccuracy={avgAccuracy}
      />


      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white border border-dashed border-[#EFEFF2] rounded-2xl p-8 text-center">
          <p className="text-[14px] font-semibold text-[#0F0F12]">No goals yet</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            Your therapist will assign specific goals. Your practice will show progress toward each one here.
          </p>
        </div>
      ) : (
        <>
          {/* Per-goal metric trends */}
          <div className="space-y-3">
            {goals.map((g) => (
              <GoalMetricTrend key={g.id} goal={g} sessions={sessionsForGoal(g)} />
            ))}
          </div>

          {/* Submitted work across all goals */}
          <SubmittedWorkFeed entries={logs} />
        </>
      )}
    </div>
  );
}