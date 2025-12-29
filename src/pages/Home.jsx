import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, Activity, TrendingDown, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { format, subDays, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', user?.assigned_trainer_id],
    queryFn: async () => {
      if (!user?.assigned_trainer_id) return null;
      const allUsers = await base44.entities.User.list();
      return allUsers.find(u => u.id === user.assigned_trainer_id) || null;
    },
    enabled: !!user?.assigned_trainer_id,
  });

  const { data: workoutPlans } = useQuery({
    queryKey: ['workoutPlans', user?.id],
    queryFn: () => base44.entities.WorkoutPlan.filter({ assigned_to_client_id: user.id }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: workoutLogs } = useQuery({
    queryKey: ['workoutLogs', user?.id],
    queryFn: () => base44.entities.WorkoutLog.filter({ logged_by_client_id: user.id }, '-completed_date'),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: painLogs } = useQuery({
    queryKey: ['painLogs', user?.id],
    queryFn: () => base44.entities.PainLog.filter({ patient_id: user.id }, '-date'),
    initialData: [],
    enabled: !!user?.id,
  });

  // Calculate adherence metrics
  const calculateAdherence = () => {
    const today = new Date();
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    // Exercise adherence (last 7 & 30 days)
    const totalPlans7 = workoutPlans.length * 7; // Assuming weekly plans
    const totalPlans30 = workoutPlans.length * 30;
    
    const completed7 = workoutLogs.filter(log => new Date(log.completed_date) >= last7Days).length;
    const completed30 = workoutLogs.filter(log => new Date(log.completed_date) >= last30Days).length;

    const adherence7 = totalPlans7 > 0 ? Math.round((completed7 / totalPlans7) * 100) : 0;
    const adherence30 = totalPlans30 > 0 ? Math.round((completed30 / totalPlans30) * 100) : 0;

    return { adherence7, adherence30, completed7, completed30, totalPlans7, totalPlans30 };
  };

  const adherence = calculateAdherence();
  const todayDate = new Date().toISOString().split('T')[0];
  const todayWorkout = workoutPlans.find(plan => plan.day_of_week === new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const todayExercises = todayWorkout?.exercises?.length || 0;
  const todayCompleted = workoutLogs.filter(log => log.completed_date === todayDate && log.workout_plan_id === todayWorkout?.id).length;

  // Get latest pain level
  const latestPain = painLogs[0];

  if (userLoading) {
    return (
      <div className="p-5 space-y-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 bg-gradient-to-b from-teal-50/30 to-white min-h-screen">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-teal-500 to-emerald-500 border-none shadow-lg">
        <CardContent className="p-6">
          <p className="text-teal-100 text-sm font-semibold mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white mb-2">{user?.full_name}</h1>
          <p className="text-teal-50 text-sm">Let's continue your recovery journey</p>
        </CardContent>
      </Card>

      {/* Exercise Completion Card */}
      <Card className="bg-white border-teal-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">EXERCISE COMPLETION</h2>
          </div>

          {/* Last 7 Days */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Last 7 Days</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${adherence.adherence7 >= 70 ? 'text-teal-600' : 'text-red-500'}`}>
                  {adherence.adherence7}%
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${adherence.adherence7 >= 70 ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                  {adherence.adherence7 >= 70 ? 'On Track' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{adherence.completed7} of {adherence.totalPlans7} exercises completed</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${adherence.adherence7 >= 70 ? 'bg-teal-500' : 'bg-red-500'}`}
                style={{ width: `${adherence.adherence7}%` }}
              />
            </div>
          </div>

          {/* Last 30 Days */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Last 30 Days</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${adherence.adherence30 >= 70 ? 'text-teal-600' : 'text-red-500'}`}>
                  {adherence.adherence30}%
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${adherence.adherence30 >= 70 ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                  {adherence.adherence30 >= 70 ? 'On Track' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{adherence.completed30} of {adherence.totalPlans30} exercises completed</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${adherence.adherence30 >= 70 ? 'bg-teal-500' : 'bg-red-500'}`}
                style={{ width: `${adherence.adherence30}%` }}
              />
            </div>
          </div>

          {/* Motivational Message */}
          {adherence.adherence7 < 70 && (
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Let's get back on track!</p>
                  <p className="text-xs text-gray-600">Consistency is key to your recovery. Your chiropractor is here to help.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Exercises */}
      <Link to={createPageUrl("Exercises")}>
        <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-900">TODAY'S EXERCISES</h2>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${todayCompleted === todayExercises && todayExercises > 0 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {todayCompleted === todayExercises && todayExercises > 0 ? '100%' : `${Math.round((todayCompleted / todayExercises) * 100) || 0}%`}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">{todayCompleted} of {todayExercises} exercises completed</p>
            
            {todayExercises > 0 ? (
              <div className="space-y-2">
                {todayWorkout.exercises.slice(0, 3).map((exercise, idx) => {
                  const isCompleted = workoutLogs.some(log => 
                    log.completed_date === todayDate && 
                    log.exercise_name === exercise.name
                  );
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{exercise.name}</p>
                        <p className="text-xs text-gray-500">{exercise.sets} sets × {exercise.reps} reps</p>
                      </div>
                    </div>
                  );
                })}
                {todayWorkout.exercises.length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-2">+{todayWorkout.exercises.length - 3} more exercises</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">No exercises scheduled for today. Rest and recover!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Quick Pain Check */}
      {latestPain && (
        <Link to={createPageUrl("Progress")}>
          <Card className="bg-white border-orange-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Latest Pain Level</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-gray-900">{latestPain.pain_level}/10</span>
                    <span className="text-sm text-gray-500">{format(new Date(latestPain.date), 'MMM d')}</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}