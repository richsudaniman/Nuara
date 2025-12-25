import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import TrainerCard from "../components/home/TrainerCard";
import DailyProgressBar from "../components/home/DailyProgressBar";
import QuickStatsGrid from "../components/home/QuickStatsGrid";
import MotivationalMessage from "../components/home/MotivationalMessage";
import TodayWorkoutPreview from "../components/home/TodayWorkoutPreview";
import NutritionSummary from "../components/home/NutritionSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const queryClient = useQueryClient();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(today);

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await base44.auth.me();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: trainer, isLoading: trainerLoading } = useQuery({
    queryKey: ['trainer', user?.assigned_trainer_id],
    queryFn: async () => {
      if (!user?.assigned_trainer_id) return null;
      const trainers = await base44.entities.User.filter({ id: user.assigned_trainer_id });
      return trainers[0] || null;
    },
    enabled: !!user?.assigned_trainer_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: workoutPlans, isLoading: workoutsLoading } = useQuery({
    queryKey: ['workoutPlans', user?.id],
    queryFn: async () => {
      return await base44.entities.WorkoutPlan.filter({ assigned_to_client_id: user.id }, 'order');
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['workoutLogs', user?.id],
    queryFn: async () => {
      return await base44.entities.WorkoutLog.filter({ logged_by_client_id: user.id }, '-completed_date');
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: calorieLogs, isLoading: calorieLogsLoading } = useQuery({
    queryKey: ['calorieLogs', user?.id],
    queryFn: async () => {
      return await base44.entities.CalorieLog.filter({ logged_by_client_id: user.id }, '-created_date');
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: motivations } = useQuery({
    queryKey: ['motivations', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await base44.entities.DailyMotivation.filter({
        sent_to_client_id: user.id,
        date: today,
        is_active: true
      });
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Don't fetch goals on home page - not critical
  const goals = [];

  const todayDate = new Date().toISOString().split('T')[0];
  const todayWorkout = workoutPlans.find(plan => plan.day_of_week === today);

  // Calculate today's tasks
  const todayExercises = todayWorkout?.exercises?.length || 0;
  const todayCompletedExercises = workoutLogs.filter(log =>
    log.completed_date === todayDate && log.workout_plan_id === todayWorkout?.id
  ).length;
  const todayCaloriesLogged = calorieLogs.filter(log => log.date === todayDate).length > 0 ? 1 : 0;
  const totalTasks = todayExercises + 1;
  const completedTasks = todayCompletedExercises + todayCaloriesLogged;

  // Calculate stats
  const thisWeekLogs = workoutLogs.filter(log => {
    const logDate = new Date(log.completed_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  const todayCalories = calorieLogs
    .filter(log => log.date === todayDate)
    .reduce((sum, log) => sum + (log.calories || 0), 0);

  const todayMacros = calorieLogs
    .filter(log => log.date === todayDate)
    .reduce((acc, log) => ({
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0),
    }), { protein: 0, carbs: 0, fats: 0 });

  const stats = {
    protein: todayMacros.protein,
    proteinGoal: user?.daily_protein_target || 150,
    calories: todayCalories,
    calorieGoal: user?.daily_calorie_target || 2200,
    workoutsThisWeek: thisWeekLogs.length,
    currentStreak: 5,
  };

  const isLoading = userLoading || workoutsLoading || logsLoading;

  // Show error message if network fails
  if (userError) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Connection Error</h2>
          <p className="text-gray-600 text-center mb-4 max-w-sm">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['currentUser'] });
              window.location.reload();
            }}
            className="bg-[#0ea5e9] text-white font-bold"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 relative">
      {/* Trainer Card */}
      {trainerLoading ? (
        <Skeleton className="h-24 rounded-lg bg-gray-100" />
      ) : (
        <TrainerCard trainer={trainer} />
      )}

      {/* Daily Progress Bar */}
      {isLoading ? (
        <Skeleton className="h-32 rounded-lg bg-gray-100" />
      ) : (
        <DailyProgressBar completedTasks={completedTasks} totalTasks={totalTasks} />
      )}

      {/* Quick Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <QuickStatsGrid stats={stats} />
      )}

      {/* Motivational Message */}
      <MotivationalMessage message={motivations?.[0]?.message} />

      {/* Today's Workout */}
      {isLoading ? (
        <Skeleton className="h-64 rounded-lg bg-gray-100" />
      ) : (
        <TodayWorkoutPreview workout={todayWorkout} />
      )}

      {/* Nutrition Summary */}
      {calorieLogsLoading ? (
        <Skeleton className="h-56 rounded-lg bg-gray-100" />
      ) : (
        <NutritionSummary
          caloriesConsumed={todayCalories}
          calorieGoal={user?.daily_calorie_target || 2200}
          macros={todayMacros}
        />
      )}
    </div>
  );
}