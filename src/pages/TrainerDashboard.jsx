import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Dumbbell, UtensilsCrossed, TrendingUp, Calendar, Award, MessageCircle, UserPlus, ChevronRight, Flame, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
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

  const { data: recentWorkoutLogs, isLoading: workoutLogsLoading } = useQuery({
    queryKey: ['recentWorkoutLogs'],
    queryFn: () => base44.entities.WorkoutLog.list('-completed_date', 50),
    initialData: [],
    enabled: !!trainer?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: recentCalorieLogs, isLoading: calorieLogsLoading } = useQuery({
    queryKey: ['recentCalorieLogs'],
    queryFn: () => base44.entities.CalorieLog.list('-created_date', 50),
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
    const workoutDates = new Set();
    recentWorkoutLogs.filter(log => 
      log.logged_by_client_id === clientId && 
      new Date(log.completed_date) >= thisWeekStart
    ).forEach(log => workoutDates.add(log.completed_date));
    return workoutDates.size;
  };

  // Calculate compliance metrics
  const calculateCompliance = () => {
    const clientIds = assignments.map(a => a.client_id);
    if (clientIds.length === 0) return { workout: 0, nutrition: 0, tracking: 0 };

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let workoutCompliant = 0;
    let nutritionCompliant = 0;
    let trackingCompliant = 0;

    clientIds.forEach(clientId => {
      const client = clients.find(c => c.id === clientId);
      
      // Workout compliance: has logged at least 3 workouts in last 7 days
      const clientWorkouts = recentWorkoutLogs.filter(log => 
        log.logged_by_client_id === clientId &&
        new Date(log.completed_date) >= sevenDaysAgo
      );
      const uniqueWorkoutDays = new Set(clientWorkouts.map(w => w.completed_date)).size;
      if (uniqueWorkoutDays >= 3) workoutCompliant++;

      // Nutrition compliance: average calories within 1000 of target
      const calorieTarget = client?.daily_calorie_target || 2200;
      const clientCalorieLogs = recentCalorieLogs.filter(log =>
        log.logged_by_client_id === clientId &&
        new Date(log.date) >= sevenDaysAgo
      );
      
      const dailyCalories = {};
      clientCalorieLogs.forEach(log => {
        if (!dailyCalories[log.date]) dailyCalories[log.date] = 0;
        dailyCalories[log.date] += log.calories || 0;
      });
      
      const avgCalories = Object.keys(dailyCalories).length > 0
        ? Object.values(dailyCalories).reduce((sum, cal) => sum + cal, 0) / Object.keys(dailyCalories).length
        : 0;
      
      if (avgCalories > 0 && Math.abs(avgCalories - calorieTarget) <= 1000) {
        nutritionCompliant++;
      }

      // Tracking compliance: has logged something in last 7 days
      const hasRecentActivity = clientWorkouts.length > 0 || clientCalorieLogs.length > 0;
      if (hasRecentActivity) trackingCompliant++;
    });

    return {
      workout: clientIds.length > 0 ? Math.round((workoutCompliant / clientIds.length) * 100) : 0,
      nutrition: clientIds.length > 0 ? Math.round((nutritionCompliant / clientIds.length) * 100) : 0,
      tracking: clientIds.length > 0 ? Math.round((trackingCompliant / clientIds.length) * 100) : 0,
    };
  };

  // Identify clients requiring attention
  const getClientsRequiringAttention = () => {
    const clientIds = assignments.map(a => a.client_id);
    const attention = [];

    clientIds.forEach(clientId => {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const reasons = [];
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Check for missed workouts (no workout logs in last 7 days but has assigned plans)
      const clientPlans = allWorkoutPlans.filter(p => p.assigned_to_client_id === clientId);
      const recentWorkouts = recentWorkoutLogs.filter(log =>
        log.logged_by_client_id === clientId &&
        new Date(log.completed_date) >= sevenDaysAgo
      );
      
      if (clientPlans.length > 0 && recentWorkouts.length === 0) {
        reasons.push('No workouts logged in 7+ days');
      }

      // Check calorie adherence
      const calorieTarget = client.daily_calorie_target || 2200;
      const clientCalorieLogs = recentCalorieLogs.filter(log =>
        log.logged_by_client_id === clientId &&
        new Date(log.date) >= sevenDaysAgo
      );

      const dailyCalories = {};
      clientCalorieLogs.forEach(log => {
        if (!dailyCalories[log.date]) dailyCalories[log.date] = 0;
        dailyCalories[log.date] += log.calories || 0;
      });

      if (Object.keys(dailyCalories).length >= 7) {
        const avgCalories = Object.values(dailyCalories).reduce((sum, cal) => sum + cal, 0) / Object.keys(dailyCalories).length;
        if (Math.abs(avgCalories - calorieTarget) > 1000) {
          const diff = avgCalories - calorieTarget;
          reasons.push(`${diff > 0 ? 'Over' : 'Under'} by ${Math.abs(Math.round(diff))} cal/day`);
        }
      }

      // Check for no logging activity
      if (recentWorkouts.length === 0 && clientCalorieLogs.length === 0) {
        reasons.push('Not tracking at all');
      }

      if (reasons.length > 0) {
        attention.push({
          client,
          reasons
        });
      }
    });

    return attention;
  };

  const compliance = calculateCompliance();
  const clientsNeedingAttention = getClientsRequiringAttention();

  // Combine and sort workout completions and meal logs
  const getRecentActivity = () => {
    const clientIds = assignments.map(a => a.client_id);
    
    // Group workout logs by client and date to count as single workout completion
    const workoutCompletions = {};
    recentWorkoutLogs.forEach(log => {
      if (clientIds.includes(log.logged_by_client_id)) {
        const key = `${log.logged_by_client_id}_${log.completed_date}`;
        if (!workoutCompletions[key]) {
          workoutCompletions[key] = {
            type: 'workout',
            clientId: log.logged_by_client_id,
            date: log.completed_date,
            exerciseCount: 1
          };
        } else {
          workoutCompletions[key].exerciseCount++;
        }
      }
    });

    // Get meal logs
    const mealLogs = recentCalorieLogs
      .filter(log => clientIds.includes(log.logged_by_client_id))
      .map(log => ({
        type: 'meal',
        clientId: log.logged_by_client_id,
        date: log.date,
        mealName: log.meal_name,
        calories: log.calories,
        created: log.created_date
      }));

    // Combine and sort by date
    const activities = [
      ...Object.values(workoutCompletions),
      ...mealLogs
    ].sort((a, b) => {
      const dateA = new Date(a.created || a.date);
      const dateB = new Date(b.created || b.date);
      return dateB - dateA;
    });

    return activities.slice(0, 10);
  };

  const isLoading = assignmentsLoading || plansLoading || nutritionLoading || goalsLoading || clientsLoading || workoutLogsLoading || calorieLogsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="absolute top-20 right-5 w-16 h-16 border-2 border-gray-200 rotate-45 pointer-events-none lg:hidden"></div>

      <div className="max-w-md lg:max-w-none">
        <h1 className="text-3xl font-black italic text-[#1a1a1a] mb-2">TRAINER DASHBOARD</h1>
        <p className="text-gray-600 italic">Manage your clients and their progress</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Overall Compliance */}
      {!isLoading && (
        <Card className="bg-white border-2 border-gray-200">
          <CardContent className="p-5">
            <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">OVERALL COMPLIANCE</h3>
            {assignments.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { metric: 'Workouts', value: compliance.workout, color: '#9333ea' },
                  { metric: 'Nutrition', value: compliance.nutrition, color: '#16a34a' },
                  { metric: 'Tracking', value: compliance.tracking, color: '#0ea5e9' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="metric" stroke="#6b7280" style={{ fontSize: '14px', fontWeight: 'bold' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #0ea5e9',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {[
                      { metric: 'Workouts', value: compliance.workout, color: '#9333ea' },
                      { metric: 'Nutrition', value: compliance.nutrition, color: '#16a34a' },
                      { metric: 'Tracking', value: compliance.tracking, color: '#0ea5e9' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 italic">Assign clients to track compliance metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clients Requiring Attention */}
      {!isLoading && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              {clientsNeedingAttention.length > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <h3 className="font-black italic text-[#1a1a1a] text-lg">CLIENTS REQUIRING ATTENTION</h3>
              {clientsNeedingAttention.length > 0 && (
                <span className="ml-auto bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {clientsNeedingAttention.length}
                </span>
              )}
            </div>
            {clientsNeedingAttention.length > 0 ? (
              <div className="space-y-2">
                {clientsNeedingAttention.map(({ client, reasons }) => (
                  <Link key={client.id} to={`${createPageUrl('TrainerClientDetail')}?clientId=${client.id}`}>
                    <div className="p-3 bg-white rounded-lg border-l-4 border-red-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          {client.profile_photo_url ? (
                            <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-red-600 font-black italic text-sm">
                              {client.full_name?.charAt(0) || 'C'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1a1a1a] text-sm">{client.full_name || 'Client'}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {reasons.map((reason, idx) => (
                              <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-400 flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 font-bold italic">All clients on track!</p>
                <p className="text-sm text-gray-500 mt-1">No clients need attention right now</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">QUICK ACTIONS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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


          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* My Clients - Quick View */}
        {clients.length > 0 && (
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black italic text-[#1a1a1a] text-lg">MY CLIENTS</h3>
              <Link to={createPageUrl("TrainerClients")}>
                <Button variant="ghost" className="text-[#0ea5e9] hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10 font-bold italic text-xs">
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
        <Card className="bg-white border-2 border-gray-200 overflow-hidden">
          <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#0ea5e9]" />
            <h3 className="font-black italic text-[#1a1a1a] text-lg">RECENT CLIENT ACTIVITY</h3>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded bg-gray-100" />)}
            </div>
          ) : getRecentActivity().length > 0 ? (
            <div className="space-y-2">
              {getRecentActivity().map((activity, idx) => {
                const client = clients.find(c => c.id === activity.clientId);
                const isWorkout = activity.type === 'workout';
                return (
                  <div key={idx} className={`flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 ${isWorkout ? 'border-purple-500' : 'border-green-500'} min-w-0`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                        {client?.profile_photo_url ? (
                          <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#0ea5e9] font-black italic text-sm">
                            {client?.full_name?.charAt(0) || 'C'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isWorkout ? (
                          <>
                            <p className="font-bold text-sm text-[#1a1a1a] truncate">Completed Workout</p>
                            <p className="text-xs text-gray-500 truncate">{client?.full_name || 'Client'} • {activity.exerciseCount} exercises</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-sm text-[#1a1a1a] truncate">{activity.mealName}</p>
                            <p className="text-xs text-gray-500 truncate">{client?.full_name || 'Client'} • {activity.calories} cal</p>
                          </>
                        )}
                      </div>
                      {isWorkout ? (
                        <Dumbbell className="w-5 h-5 text-purple-600" />
                      ) : (
                        <UtensilsCrossed className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-xs text-gray-400">{format(new Date(activity.date), 'MMM d')}</p>
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
                  <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic shadow-md">
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
    </div>
  );
}