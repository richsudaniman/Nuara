import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WeeklySummaryCard from "@/components/shared/WeeklySummaryCard";
import GoalMetricTrend from "@/components/progress/GoalMetricTrend";
import SubmittedWorkFeed from "@/components/progress/SubmittedWorkFeed";
import GoalReportDialog from "@/components/progress/GoalReportDialog";

export default function ProgressGoals() {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const { data: therapist } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["trainerAssignments", therapist?.id],
    queryFn: () =>
      base44.entities.PractitionerPatientAssignment.filter({ trainer_id: therapist.id, is_active: true }),
    enabled: !!therapist?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!therapist?.id,
    staleTime: 5 * 60 * 1000,
  });

  const clients = useMemo(
    () => allUsers.filter((u) => assignments.map((a) => a.client_id).includes(u.id)),
    [allUsers, assignments]
  );

  const activeClientId = selectedClientId || clients[0]?.id || null;
  const activeClient = clients.find((c) => c.id === activeClientId);

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["clientGoals", activeClientId],
    queryFn: () =>
      base44.entities.TherapyGoal.filter({ assigned_to_client_id: activeClientId, is_active: true }),
    enabled: !!activeClientId,
    staleTime: 60 * 1000,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["clientLogs", activeClientId],
    queryFn: () =>
      base44.entities.TherapyLog.filter({ logged_by_client_id: activeClientId }, "-completed_date", 300),
    enabled: !!activeClientId,
    staleTime: 60 * 1000,
  });

  const isLoading = assignmentsLoading || goalsLoading || logsLoading;

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
  const workForSelectedGoal = goals.length ? workForGoal(goals[0]) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Progress & goals</h1>
          <span className="text-sm text-gray-400">Goal tracking & progress data</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </Button>
      </div>

      {/* Client + action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <select
          value={activeClientId || ""}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-purple-400"
        >
          {clients.length === 0 && <option value="">No clients assigned</option>}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
        <Button
          onClick={() => setReportOpen(true)}
          disabled={!activeClientId || goals.length === 0}
          className="gap-2 border-gray-200 text-sm h-10"
          variant="outline"
        >
          <FileText className="w-4 h-4" />
          Generate report
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : !activeClientId ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-gray-700">No clients in your caseload yet</p>
          <p className="text-sm text-gray-400 mt-1">Assign clients to see their goal progress.</p>
        </div>
      ) : (
        <>
          <WeeklySummaryCard clientId={activeClientId} title="Patient weekly summary" />

          {/* Practice analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Active goals" value={goals.length} />
            <StatTile
              label="Avg accuracy"
              value={
                logs.filter((l) => l.metric_value != null).length
                  ? `${Math.round(
                      logs.filter((l) => l.metric_value != null).reduce((s, l) => s + l.metric_value, 0) /
                        logs.filter((l) => l.metric_value != null).length
                    )}%`
                  : "—"
              }
            />
            <StatTile
              label="Days practiced (wk)"
              value={`${new Set(
                logs
                  .filter((l) => new Date(l.completed_date) >= new Date(Date.now() - 7 * 86400000))
                  .map((l) => l.completed_date)
              ).size}/5`}
            />
            <StatTile label="Submissions" value={logs.length} />
          </div>

          {/* Per-goal metric trends */}
          {goals.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-sm font-semibold text-gray-700">No goals set for this patient</p>
              <p className="text-sm text-gray-400 mt-1">
                Create goals to track specific metrics (e.g., /r/ accuracy) over time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.map((g) => (
                <GoalMetricTrend key={g.id} goal={g} sessions={sessionsForGoal(g)} />
              ))}
            </div>
          )}

          {/* Submitted work feeding the first/selected goal */}
          {goals.length > 0 && (
            <SubmittedWorkFeed entries={workForSelectedGoal} />
          )}
        </>
      )}

      <GoalReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        clientName={activeClient?.full_name}
        goals={goals}
        sessions={logs}
      />
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-1.5">{label}</p>
    </div>
  );
}