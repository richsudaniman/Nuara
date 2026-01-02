import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, Activity, TrendingDown, TrendingUp, CheckCircle, AlertTriangle, Star, Flame, Trophy, Sparkles, Gamepad2, PlayCircle } from "lucide-react";
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

  // Mock therapy activities for demo
  const mockTodayActivities = [
    { id: 1, name: "Practice /s/ Sound", reps: 10, completed: true },
    { id: 2, name: "Sentence Builder - Level 3", reps: 5, completed: true },
    { id: 3, name: "Tongue Twisters Challenge", reps: 8, completed: false },
    { id: 4, name: "Listening Comprehension", reps: 1, completed: false },
    { id: 5, name: "Word Association Game", reps: 15, completed: false }
  ];

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
  
  // Use mock data if no real data exists
  const todayExercises = todayWorkout?.exercises?.length || mockTodayActivities.length;
  const todayCompleted = todayWorkout ? workoutLogs.filter(log => log.completed_date === todayDate && log.workout_plan_id === todayWorkout?.id).length : mockTodayActivities.filter(a => a.completed).length;

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

  // Mock gamification data (will be replaced with real data later)
  const mockPoints = 1250;
  const mockLevel = 5;
  const mockLevelName = "Word Wizard";
  const mockStreak = 7;
  const mockNextLevelPoints = 1500;
  const mockProgressToNextLevel = Math.round((mockPoints / mockNextLevelPoints) * 100);

  return (
    <div className="p-5 space-y-5 bg-gradient-to-b from-purple-50/30 via-blue-50/20 to-white min-h-screen">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 border-none shadow-lg">
        <CardContent className="p-6">
          <p className="text-purple-100 text-sm font-semibold mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white mb-2">{user?.full_name}</h1>
          <p className="text-purple-50 text-sm">Let's practice together today! 🎯</p>
        </CardContent>
      </Card>

      {/* Gamification Hub */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-black text-gray-900">{mockPoints} Points</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Level {mockLevel}: {mockLevelName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-md">
                <Flame className="w-5 h-5 text-white" />
                <span className="text-lg font-black text-white">{mockStreak} Day Streak!</span>
              </div>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">Progress to Level {mockLevel + 1}</span>
              <span className="font-bold text-purple-600">{mockPoints} / {mockNextLevelPoints}</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${mockProgressToNextLevel}%` }}
              />
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="mt-4 p-3 bg-white rounded-xl border-2 border-yellow-300 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <p className="text-sm font-semibold text-gray-700">Keep it up! You're on fire this week! 🔥</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Therapist Card */}
      <Card className="bg-white border-purple-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {provider?.full_name?.charAt(0) || 'E'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 mb-1">YOUR SPEECH THERAPIST</p>
              <p className="text-lg font-bold text-gray-900">{provider?.full_name || "Dr. Emily Chen"}</p>
            </div>
            <Link to={createPageUrl("MockMessages")}>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                Message
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Today's Therapy Homework */}
      <Link to={createPageUrl("Exercises")}>
        <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Today's Therapy Homework</h2>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${todayCompleted === todayExercises && todayExercises > 0 ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'}`}>
                {todayCompleted === todayExercises && todayExercises > 0 ? '✓ Complete!' : `${todayCompleted}/${todayExercises}`}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Daily Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round((todayCompleted / todayExercises) * 100) || 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((todayCompleted / todayExercises) * 100) || 0}%` }}
                />
              </div>
            </div>
            
            {todayExercises > 0 ? (
              <div className="space-y-2">
                {(todayWorkout?.exercises || mockTodayActivities).slice(0, 3).map((exercise, idx) => {
                  const isCompleted = todayWorkout 
                    ? workoutLogs.some(log => log.completed_date === todayDate && log.exercise_name === exercise.name)
                    : exercise.completed;
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${isCompleted ? 'bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-3 border-gray-300 bg-white shadow-sm" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{exercise.name}</p>
                        <p className="text-xs text-gray-600">Repeat {exercise.reps || 10} times</p>
                      </div>
                      {!isCompleted && (
                        <PlayCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                  );
                })}
                {(todayWorkout?.exercises.length > 3 || mockTodayActivities.length > 3) && (
                  <p className="text-xs text-gray-500 text-center pt-2 font-semibold">+{(todayWorkout?.exercises.length || mockTodayActivities.length) - 3} more activities to complete</p>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-200">
                <Activity className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No homework scheduled for today</p>
                <p className="text-xs text-gray-500 mt-1">Check out Extra Practice below!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Extra Practice & Games */}
      <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-pink-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Extra Practice & Games</h2>
              <p className="text-sm text-gray-600">Boost your skills with fun activities!</p>
            </div>
          </div>

          {/* Featured Practice Activities */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link to={createPageUrl("Learn")}>
              <div className="p-4 bg-white rounded-xl shadow-sm border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2 shadow-md">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Sound Match Game</p>
                <p className="text-xs text-gray-500">Practice /s/ sounds</p>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-yellow-600">+10 pts</span>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("Learn")}>
              <div className="p-4 bg-white rounded-xl shadow-sm border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-2 shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Sentence Builder</p>
                <p className="text-xs text-gray-500">Build complex sentences</p>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-yellow-600">+15 pts</span>
                </div>
              </div>
            </Link>
          </div>

          <Link to={createPageUrl("Learn")}>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl shadow-md">
              <Gamepad2 className="w-5 h-5 mr-2" />
              View All Practice Games
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* My Progress Overview */}
      <Link to={createPageUrl("Progress")}>
        <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-900">My Therapy Goals</h2>
              </div>
              <span className="text-xs font-semibold text-teal-600">View All →</span>
            </div>

            <div className="space-y-3">
              {/* Goal 1 */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900">/r/ Sound Accuracy</p>
                  <span className="text-2xl font-black text-teal-600">78%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: '78%' }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">Target: 90% accuracy by March 2026</p>
              </div>

              {/* Goal 2 */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900">Sentence Complexity</p>
                  <span className="text-2xl font-black text-purple-600">65%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">Target: 7-word sentences consistently</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

    </div>
  );
}