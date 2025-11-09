import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Dumbbell, UtensilsCrossed, TrendingUp, Calendar, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

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

  const isLoading = assignmentsLoading || plansLoading || nutritionLoading || goalsLoading;

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-20 right-5 w-16 h-16 border-2 border-gray-200 rotate-45 pointer-events-none"></div>

      {/* Role Switcher Link */}
      <Link to={createPageUrl("SwitchRole")}>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold italic shadow-lg">
          🔄 Switch Role (Client / Trainer / Admin)
        </Button>
      </Link>

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
            <Link to={createPageUrl("TrainerClients")}>
              <div className="p-4 bg-gray-50 border-l-4 border-[#0ea5e9] hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">Manage Clients</p>
                <p className="text-xs text-gray-600">View and update client programs</p>
              </div>
            </Link>

            <Link to={createPageUrl("TrainerAssignClients")}>
              <div className="p-4 bg-gray-50 border-l-4 border-purple-500 hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">Assign New Clients</p>
                <p className="text-xs text-gray-600">Take on new clients</p>
              </div>
            </Link>

            <Link to={createPageUrl("TrainerVideos")}>
              <div className="p-4 bg-gray-50 border-l-4 border-green-500 hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">Upload Videos</p>
                <p className="text-xs text-gray-600">Add exercise demonstrations</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">RECENT CLIENT ACTIVITY</h3>
          {logsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded bg-gray-100" />)}
            </div>
          ) : recentLogs.length > 0 ? (
            <div className="space-y-2">
              {recentLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">{log.exercise_name}</p>
                    <p className="text-xs text-gray-500">Client ID: {log.logged_by_client_id?.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{log.completed_date}</p>
                    <p className="text-xs text-[#0ea5e9] font-bold">{log.sets_completed} sets</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 italic py-4">No recent activity from your clients</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}