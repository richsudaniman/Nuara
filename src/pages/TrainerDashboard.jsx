import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageCircle, Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, startOfWeek, format } from "date-fns";
import QuickActionsGrid from "@/components/slp/QuickActionsGrid";
import ClientAdherenceCard from "@/components/slp/ClientAdherenceCard";
import RecentActivityFeed from "@/components/slp/RecentActivityFeed";
import GoalProgressPanel from "@/components/slp/GoalProgressPanel";

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

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["trainerClients", assignments],
    queryFn: async () => {
      const clientIds = assignments.map((a) => a.client_id);
      if (clientIds.length === 0) return [];
      const allUsers = await base44.entities.User.list();
      return allUsers.filter((u) => clientIds.includes(u.id));
    },
    enabled: assignments.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workoutLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["allWorkoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-completed_date", 200),
    enabled: !!therapist?.id,
    staleTime: 2 * 60 * 1000,
  });

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["unreadMessages", therapist?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ receiver_id: therapist.id, is_read: false }),
    enabled: !!therapist?.id,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Weekly practice sessions for bar chart (last 6 weeks)
  const getWeeklyData = () => {
    const clientIds = assignments.map((a) => a.client_id);
    return Array.from({ length: 6 }, (_, i) => {
      const weekStart = startOfWeek(subDays(new Date(), (5 - i) * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const count = workoutLogs.filter((log) => {
        const d = new Date(log.completed_date);
        return clientIds.includes(log.logged_by_client_id) && d >= weekStart && d <= weekEnd;
      }).length;
      return { week: format(weekStart, "MMM d"), sessions: count };
    });
  };

  // Clients needing attention: no activity in last 7 days but have assignments
  const clientsNeedingAttention = clients.filter((c) => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const hasRecent = workoutLogs.some(
      (l) => l.logged_by_client_id === c.id && new Date(l.completed_date) >= sevenDaysAgo
    );
    return !hasRecent;
  });

  // Overall adherence (% of clients with ≥3 sessions this week)
  const activeCount = clients.filter((c) => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const days = new Set(
      workoutLogs
        .filter((l) => l.logged_by_client_id === c.id && new Date(l.completed_date) >= sevenDaysAgo)
        .map((l) => l.completed_date)
    ).size;
    return days >= 3;
  }).length;
  const overallAdherence = clients.length > 0 ? Math.round((activeCount / clients.length) * 100) : 0;

  const isLoading = assignmentsLoading || clientsLoading || logsLoading;

  const weeklyData = getWeeklyData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Welcome back</p>
        <h1 className="text-3xl font-bold text-gray-900">{therapist?.full_name || "Practitioner"}</h1>
        <p className="text-sm text-gray-500 mt-1">Speech-Language Pathologist · SLP-tec Practitioner Portal</p>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500">
            <CardContent className="p-5">
              <Users className="w-6 h-6 text-white/80 mb-2" />
              <p className="text-3xl font-black text-white">{assignments.length}</p>
              <p className="text-xs text-white/70 font-semibold mt-1">Active Patients</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
            <CardContent className="p-5">
              <TrendingUp className="w-6 h-6 text-white/80 mb-2" />
              <p className="text-3xl font-black text-white">{overallAdherence}%</p>
              <p className="text-xs text-white/70 font-semibold mt-1">Avg. Adherence</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500">
            <CardContent className="p-5">
              <MessageCircle className="w-6 h-6 text-white/80 mb-2" />
              <p className="text-3xl font-black text-white">{unreadMessages.length}</p>
              <p className="text-xs text-white/70 font-semibold mt-1">Unread Messages</p>
            </CardContent>
          </Card>

          <Card className={`border-none shadow-sm rounded-2xl ${clientsNeedingAttention.length > 0 ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-gray-400 to-gray-500"}`}>
            <CardContent className="p-5">
              <AlertCircle className="w-6 h-6 text-white/80 mb-2" />
              <p className="text-3xl font-black text-white">{clientsNeedingAttention.length}</p>
              <p className="text-xs text-white/70 font-semibold mt-1">Need Attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
        <QuickActionsGrid />
      </div>

      {/* Clients Needing Attention */}
      {clientsNeedingAttention.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Patients Needing Attention
          </h2>
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {clientsNeedingAttention.slice(0, 5).map((client) => (
                  <Link key={client.id} to={`${createPageUrl("TrainerClientDetail")}?clientId=${client.id}`}>
                    <div className="px-5 py-4 flex items-center gap-3 hover:bg-red-50/40 transition-colors cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                        {client.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{client.full_name}</p>
                        <p className="text-xs text-red-500">No activity in 7+ days</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">Follow Up</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Sessions Chart */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Weekly Practice Sessions (All Patients)</h2>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
                  formatter={(v) => [`${v} sessions`, "Total"]}
                />
                <Bar dataKey="sessions" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Three-column data panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClientAdherenceCard clients={clients} assignments={assignments} workoutLogs={workoutLogs} />
        <RecentActivityFeed workoutLogs={workoutLogs} clients={clients} />
        <GoalProgressPanel goals={[]} />
      </div>
    </div>
  );
}