import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { format, subDays, startOfWeek } from "date-fns";

import DashboardStatCards from "@/components/slp/DashboardStatCards";
import AlertsPanel from "@/components/slp/AlertsPanel";
import TodaysSessionsPanel from "@/components/slp/TodaysSessionsPanel";
import ComplianceTrendPanel from "@/components/slp/ComplianceTrendPanel";
import CaseloadComplianceList from "@/components/slp/CaseloadComplianceList";
import { createPageUrl } from "@/utils";

export default function TrainerDashboard() {
  const { data: therapist } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["trainerAssignments", therapist?.id],
    queryFn: () => base44.entities.TrainerClientAssignment.filter({ trainer_id: therapist.id, is_active: true }),
    enabled: !!therapist?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!therapist?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workoutLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["allWorkoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-completed_date", 500),
    enabled: !!therapist?.id,
    staleTime: 2 * 60 * 1000,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["todaySessions", therapist?.id],
    queryFn: () => base44.entities.ScheduledSession.filter({ trainer_id: therapist.id }),
    enabled: !!therapist?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = assignmentsLoading || usersLoading || logsLoading;

  const clientIds = assignments.map((a) => a.client_id);
  const clients = allUsers.filter((u) => clientIds.includes(u.id));

  // --- Demo data fallback for empty caseload ---
  const isDemo = !isLoading && assignments.length === 0;

  // --- Greeting ---
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = therapist?.full_name?.split(" ").pop() || "";
  const todayFormatted = format(new Date(), "EEE MMM d");

  // --- Today's sessions ---
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaySessions = sessions
    .filter((s) => s.start_time?.startsWith(todayStr))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((s) => {
      const client = allUsers.find((u) => u.id === s.client_id);
      const sessionTime = format(new Date(s.start_time), "HH:mm");
      const hoursUntil = (new Date(s.start_time) - new Date()) / 3600000;
      let tag = "";
      let tagType = "default";
      if (hoursUntil > 0 && hoursUntil <= 2) { tag = `In ${Math.round(hoursUntil)}h`; tagType = "soon"; }
      else if (hoursUntil > 2 && hoursUntil <= 6) { tag = "Afternoon"; tagType = "afternoon"; }
      else if (s.notes?.toLowerCase().includes("prep")) { tag = "Prep needed"; tagType = "prep"; }
      return {
        time: sessionTime,
        clientName: client?.full_name || "Unknown",
        sessionType: s.notes || "Session",
        tag,
        tagType,
      };
    });

  // --- Compliance per client (last 7 days) ---
  const getClientCompliance = (clientId) => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const logs = workoutLogs.filter(
      (l) => l.logged_by_client_id === clientId && new Date(l.completed_date) >= sevenDaysAgo
    );
    const uniqueDays = new Set(logs.map((l) => l.completed_date)).size;
    return Math.min(Math.round((uniqueDays / 5) * 100), 100);
  };

  const clientCompliance = clients
    .map((c) => ({
      id: c.id,
      name: c.full_name || "Unknown",
      focusArea: c.therapy_focus || "Articulation",
      compliance: getClientCompliance(c.id),
    }))
    .sort((a, b) => b.compliance - a.compliance);

  const avgCompliance = clientCompliance.length > 0
    ? Math.round(clientCompliance.reduce((s, c) => s + c.compliance, 0) / clientCompliance.length)
    : 0;

  // --- Compliance last week for comparison ---
  const getAvgComplianceForWeek = (weeksAgo) => {
    const weekStart = startOfWeek(subDays(new Date(), weeksAgo * 7), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (clients.length === 0) return 0;
    const scores = clients.map((c) => {
      const logs = workoutLogs.filter((l) => {
        const d = new Date(l.completed_date);
        return l.logged_by_client_id === c.id && d >= weekStart && d <= weekEnd;
      });
      const days = new Set(logs.map((l) => l.completed_date)).size;
      return Math.min(Math.round((days / 5) * 100), 100);
    });
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  };

  const lastWeekCompliance = getAvgComplianceForWeek(1);
  const complianceChange = avgCompliance - lastWeekCompliance;

  // --- Weekly trend data for chart ---
  const weeklyTrendData = Array.from({ length: 5 }, (_, i) => ({
    label: i === 4 ? "Now" : `W${i + 1}`,
    value: i === 4 ? avgCompliance : getAvgComplianceForWeek(4 - i),
  }));

  // --- Stat cards data ---
  const statData = {
    activeClients: assignments.length,
    onHold: 0,
    avgCompliance,
    complianceChange,
    pendingRecordings: 0,
    plansExpiring: 0,
  };

  // --- Alerts ---
  const alerts = [];
  // Clients with 0% compliance
  clientCompliance.filter((c) => c.compliance === 0).forEach((c) => {
    const lastLog = workoutLogs
      .filter((l) => l.logged_by_client_id === c.id)
      .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))[0];
    const daysInactive = lastLog
      ? Math.round((new Date() - new Date(lastLog.completed_date)) / 86400000)
      : null;
    alerts.push({
      type: "urgent",
      title: `${c.name} — no activity for ${daysInactive ?? "??"} days`,
      description: `0% this week · Check in needed`,
      linkLabel: "View client →",
      linkTo: `${createPageUrl("TrainerClientDetail")}?clientId=${c.id}`,
    });
  });
  // Low compliance clients (below 50% but not 0)
  clientCompliance.filter((c) => c.compliance > 0 && c.compliance < 50).forEach((c) => {
    alerts.push({
      type: "warning",
      title: `${c.name} — compliance at ${c.compliance}%`,
      description: `Consider checking in or updating plan`,
      linkLabel: "View client →",
      linkTo: `${createPageUrl("TrainerClientDetail")}?clientId=${c.id}`,
    });
  });

  // --- Demo overrides ---
  const DEMO_DATA = {
    statData: {
      activeClients: 14,
      onHold: 2,
      avgCompliance: 78,
      complianceChange: 5,
      pendingRecordings: 6,
      plansExpiring: 3,
    },
    todaySessions: [
      { time: "09:00", clientName: "Jalal Abdelrahim", sessionType: "Articulation · /r/ /s/", tag: "In 1h", tagType: "soon" },
      { time: "10:30", clientName: "Mia Chen", sessionType: "Language · sentence building", tag: "Prep needed", tagType: "prep" },
      { time: "13:00", clientName: "Noah Patel", sessionType: "Fluency · easy onset", tag: "Afternoon", tagType: "afternoon" },
      { time: "14:30", clientName: "Sophia Reyes", sessionType: "Reassessment", tag: "Afternoon", tagType: "afternoon" },
    ],
    alerts: [
      {
        type: "urgent",
        title: "Liam Garcia — no activity for 9 days",
        description: "0% this week · Check in needed",
        linkLabel: "View client →",
        linkTo: createPageUrl("TrainerClientDetail"),
      },
      {
        type: "warning",
        title: "Olivia Brooks — compliance at 32%",
        description: "Down from 71% last week · Consider check in",
        linkLabel: "View client →",
        linkTo: createPageUrl("TrainerClientDetail"),
      },
      {
        type: "warning",
        title: "6 recordings awaiting review",
        description: "Oldest submitted 3 days ago",
        linkLabel: "Open recordings →",
        linkTo: createPageUrl("Recordings"),
      },
      {
        type: "info",
        title: "3 homework plans expire by Sunday",
        description: "Jalal A., Mia C., Noah P.",
        linkLabel: "Open homework builder →",
        linkTo: createPageUrl("HomeworkBuilder"),
      },
    ],
    weeklyTrendData: [
      { label: "W1", value: 64 },
      { label: "W2", value: 70 },
      { label: "W3", value: 73 },
      { label: "W4", value: 75 },
      { label: "Now", value: 78 },
    ],
    caseloadCompliance: [
      { id: "d1", name: "Jalal Abdelrahim", focusArea: "Articulation · /r/ /s/", compliance: 86 },
      { id: "d2", name: "Mia Chen", focusArea: "Language", compliance: 82 },
      { id: "d3", name: "Noah Patel", focusArea: "Fluency", compliance: 76 },
      { id: "d4", name: "Sophia Reyes", focusArea: "Articulation · /th/", compliance: 68 },
      { id: "d5", name: "Olivia Brooks", focusArea: "Language · vocabulary", compliance: 32 },
      { id: "d6", name: "Liam Garcia", focusArea: "Articulation · /l/", compliance: 0 },
    ],
    totalCaseload: 14,
  };

  const finalStatData = isDemo ? DEMO_DATA.statData : statData;
  const finalSessions = isDemo ? DEMO_DATA.todaySessions : todaySessions;
  const finalAlerts = isDemo ? DEMO_DATA.alerts : alerts;
  const finalAvgCompliance = isDemo ? DEMO_DATA.statData.avgCompliance : avgCompliance;
  const finalWeeklyTrend = isDemo ? DEMO_DATA.weeklyTrendData : weeklyTrendData;
  const finalCaseload = isDemo ? DEMO_DATA.caseloadCompliance : clientCompliance.slice(0, 6);
  const finalTotalCount = isDemo ? DEMO_DATA.totalCaseload : clientCompliance.length;
  const finalSessionCount = isDemo ? DEMO_DATA.todaySessions.length : todaySessions.length;
  const finalFirstName = therapist?.full_name?.split(" ").pop() || (isDemo ? "Chen" : "");

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Skeleton className="h-64 rounded-xl lg:col-span-3" />
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Dr. {finalFirstName}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {todayFormatted} · {finalSessionCount} session{finalSessionCount !== 1 ? "s" : ""} today
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors self-start">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </button>
      </div>

      {/* Stat Cards */}
      <DashboardStatCards data={finalStatData} />

      {/* Middle row: Alerts + Sessions / Compliance trend */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Alerts */}
        <div className="lg:col-span-3 space-y-4">
          <AlertsPanel alerts={finalAlerts} />
        </div>

        {/* Right: Sessions + Trend */}
        <div className="lg:col-span-2 space-y-4">
          <TodaysSessionsPanel sessions={finalSessions} />
          <ComplianceTrendPanel currentCompliance={finalAvgCompliance} weeklyData={finalWeeklyTrend} />
        </div>
      </div>

      {/* Caseload compliance */}
      <CaseloadComplianceList
        clients={finalCaseload}
        totalCount={finalTotalCount}
      />
    </div>
  );
}