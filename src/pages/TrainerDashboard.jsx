import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Dumbbell, UtensilsCrossed, TrendingUp, Calendar, Award, MessageCircle, UserPlus, ChevronRight, Flame, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function TrainerDashboard() {
  const { data: trainer } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['trainerAssignments', trainer?.id],
    queryFn: () => base44.entities.TrainerClientAssignment.filter({ trainer_id: trainer.id, is_active: true }),
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['trainerClients', trainer?.id],
    queryFn: async () => {
      const clientIds = assignments.map(a => a.client_id);
      if (clientIds.length === 0) return [];
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => clientIds.includes(u.id));
    },
    initialData: [],
    enabled: !!trainer?.id && assignments.length > 0,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: allWorkoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['allWorkoutPlans', trainer?.id],
    queryFn: async () => {
      return await base44.entities.WorkoutPlan.filter({ created_by_trainer_id: trainer.id });
    },
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: allNutritionPlans, isLoading: nutritionLoading } = useQuery({
    queryKey: ['allNutritionPlans', trainer?.id],
    queryFn: async () => {
      return await base44.entities.NutritionPlan.filter({ created_by_trainer_id: trainer.id });
    },
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: allGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['allGoals', trainer?.id],
    queryFn: async () => {
      return await base44.entities.FitnessGoal.filter({ created_by_trainer_id: trainer.id, is_active: true });
    },
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['recentWorkoutLogs'],
    queryFn: () => base44.entities.WorkoutLog.list('-completed_date', 10),
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = [
    { icon: Users, label: "Active Clients", value: assignments.length, color: "text-[#0ea5e9]", bgColor: "bg-[#0ea5e9]/10", link: createPageUrl("TrainerClients") },
    { icon: Dumbbell, label: "Workout Plans", value: allWorkoutPlans.length, color: "text-purple-600", bgColor: "bg-purple-100", link: createPageUrl("TrainerClients") },
    { icon: UtensilsCrossed, label: "Meal Plans", value: allNutritionPlans.length, color: "text-green-600", bgColor: "bg-green-100", link: createPageUrl("TrainerClients") },
    { icon: Award, label: "Active Goals", value: allGoals.length, color: "text-orange-600", bgColor: "bg-orange-100", link: createPageUrl("TrainerClients") },
  ];

  const getClientWeeklyWorkouts = (clientId) => {
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    return recentLogs.filter(log => 
      log.logged_by_client_id === clientId && 
      new Date(log.completed_date) >= thisWeekStart
    ).length;
  };

  const isLoading = assignmentsLoading || plansLoading || nutritionLoading || goalsLoading || clientsLoading;

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-20 right-5 w-16 h-16 border-2 border-gray-200 rotate-45 pointer-events-none"></div>

      <div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a] mb-2">TRAINER DASHBOARD</h1>
        <p className="text-gray-600 italic">Manage your clients and their progress</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="bg-white border border-gray-200 hover:border-[#0ea5e9] transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</p>
                  <p className="text-3xl font-black italic text-[#1a1a1a]">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">QUICK ACTIONS</h3>
          <div className="grid gap-3">
            <Link to={createPageUrl("TrainerAssignClients")}>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Assign New Clients</p>
                    <p className="text-xs text-gray-600">Take on new clients to train</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("TrainerClients")}>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-[#0ea5e9] hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-[#0ea5e9]" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Manage Clients</p>
                    <p className="text-xs text-gray-600">View and update client programs</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("TrainerMessages")}>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Message Clients</p>
                    <p className="text-xs text-gray-600">Send messages and motivation</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* My Clients - Quick View */}
      {clients.length > 0 && (
        <Card className="bg-white border-2 border-gray-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black italic text-[#1a1a1a] text-lg">MY CLIENTS</h3>
              <Link to={createPageUrl("TrainerClients")}>
                <Button variant="ghost" className="text-[#0ea5e9] hover:text-[#0284c7] font-bold italic text-xs">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {clients.slice(0, 5).map(client => {
                const weeklyWorkouts = getClientWeeklyWorkouts(client.id);
                return (
                  <Link key={client.id} to={`${createPageUrl('TrainerClientDetail')}?clientId=${client.id}`}>
                    <div className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-[#0ea5e9] hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                          {client.profile_photo_url ? (
                            <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-[#0ea5e9] font-black italic text-lg">
                              {client.full_name?.charAt(0) || 'C'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold italic text-[#1a1a1a] text-sm">{client.full_name || 'Client'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-gray-600 font-semibold">{weeklyWorkouts} workouts this week</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#0ea5e9]" />
            <h3 className="font-black italic text-[#1a1a1a] text-lg">RECENT CLIENT ACTIVITY</h3>
          </div>
          {logsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded bg-gray-100" />)}
            </div>
          ) : recentLogs.length > 0 ? (
            <div className="space-y-2">
              {recentLogs.slice(0, 8).map(log => {
                const client = clients.find(c => c.id === log.logged_by_client_id);
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-[#0ea5e9]">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                        {client?.profile_photo_url ? (
                          <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#0ea5e9] font-black italic text-sm">
                            {client?.full_name?.charAt(0) || 'C'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#1a1a1a]">{log.exercise_name}</p>
                        <p className="text-xs text-gray-500">{client?.full_name || 'Client'} • {log.sets_completed} sets</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{format(new Date(log.completed_date), 'MMM d')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 italic">No recent activity from your clients</p>
              {assignments.length === 0 && (
                <Link to={createPageUrl("TrainerAssignClients")} className="mt-3 inline-block">
                  <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Your First Client
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}