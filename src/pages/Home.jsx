import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Sparkles, Star, TrendingUp, Gamepad2, ArrowRight, CheckCircle2, PlayCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WeeklySummaryCard from "@/components/shared/WeeklySummaryCard";

export default function Home() {
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
    queryFn: () => base44.entities.TherapyPlan.filter({ assigned_to_client_id: user.id }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: workoutLogs } = useQuery({
    queryKey: ['workoutLogs', user?.id],
    queryFn: () => base44.entities.TherapyLog.filter({ logged_by_client_id: user.id }, '-completed_date'),
    initialData: [],
    enabled: !!user?.id,
  });

  const todayDate = new Date().toISOString().split('T')[0];
  const todayWorkout = workoutPlans.find(plan => plan.day_of_week === new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const todayExercises = todayWorkout?.exercises?.length || mockTodayActivities.length;
  const todayCompleted = todayWorkout
    ? workoutLogs.filter(log => log.completed_date === todayDate && log.workout_plan_id === todayWorkout?.id).length
    : mockTodayActivities.filter(a => a.completed).length;

  if (userLoading) {
    return (
      <div className="px-5 py-6 space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  // Mock gamification
  const points = 1250;
  const level = 5;
  const levelName = "Word Wizard";
  const streak = 7;
  const nextLevelPoints = 1500;
  const progressPct = Math.round((points / nextLevelPoints) * 100);

  const firstName = user?.full_name || "Friend";
  const therapistName = provider?.full_name || "Dr. Emily Chen";
  const therapistInitial = therapistName.charAt(0);

  const todayActivities = todayWorkout?.exercises || mockTodayActivities;

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-5 py-6 space-y-5">
      {/* Welcome */}
      <div className="space-y-1.5">
        <h1 className="text-[28px] leading-[1.15] font-bold text-[#0F0F12] tracking-tight">
          Welcome back,
          <br />
          {firstName}. <span className="inline-block ml-1">🎯</span>
        </h1>
        <p className="text-[15px] text-[#6B6B75] font-normal">Let's practice together today!</p>
      </div>

      <WeeklySummaryCard title="This week" />

      {/* Points Card */}
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[32px] leading-none font-bold text-[#0F0F12]">{points}</p>
            <p className="text-[20px] font-semibold text-[#0F0F12] mt-0.5">Points</p>
            <p className="text-[13px] text-[#6B6B75] mt-1.5">Level {level}: {levelName}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 border border-[#EFEFF2] rounded-xl bg-white">
            <Flame className="w-4 h-4 text-[#F97316]" />
            <div className="text-[12px] font-bold text-[#0F0F12] leading-tight">
              {streak} Day<br />Streak!
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6B6B75] font-medium">Progress to Level {level + 1}</span>
            <span className="text-[#6B6B75] font-medium">{points} / {nextLevelPoints}</span>
          </div>
          <div className="h-1.5 bg-[#F1F1F4] rounded-full overflow-hidden">
            <div className="h-full bg-[#A78BFA] rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#FAFAFB] border border-[#EFEFF2] rounded-xl">
          <Sparkles className="w-4 h-4 text-[#A78BFA] flex-shrink-0" />
          <p className="text-[13px] text-[#0F0F12] font-medium">Keep it up! You're on fire this week! 🔥</p>
        </div>
      </div>

      {/* Therapist */}
      <Link to={createPageUrl("MockMessages")}>
        <div className="bg-white border border-[#EFEFF2] rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-[#E5E5EA] transition-colors">
          <div className="w-11 h-11 rounded-full bg-[#A78BFA] flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
            {therapistInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Your speech therapist</p>
            <p className="text-[15px] font-semibold text-[#0F0F12] truncate">{therapistName}</p>
          </div>
          <button className="px-4 py-2 bg-[#A78BFA] hover:bg-[#9275F5] text-white text-[13px] font-semibold rounded-xl transition-colors">
            Message
          </button>
        </div>
      </Link>

      {/* Today's Therapy */}
      <Link to={createPageUrl("Exercises")} className="block">
        <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5 hover:border-[#E5E5EA] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-[#0F0F12]">Today's Therapy</h2>
            <span className="text-[12px] font-medium text-[#6B6B75]">{todayCompleted}/{todayExercises}</span>
          </div>

          <div className="space-y-2">
            {todayActivities.slice(0, 3).map((exercise, idx) => {
              const isCompleted = todayWorkout
                ? workoutLogs.some(log => log.completed_date === todayDate && log.exercise_name === exercise.name)
                : exercise.completed;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border border-[#EFEFF2] rounded-xl bg-[#FAFAFB]"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-[#EDE7FE]' : 'border border-[#EFEFF2] bg-white'}`}>
                    {isCompleted ? (
                      <Heart className="w-4 h-4 text-[#A78BFA] fill-[#A78BFA]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D1D1D6]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0F0F12] truncate">{exercise.name}</p>
                    <p className="text-[12px] text-[#6B6B75]">Repeat {exercise.reps || 10} times</p>
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-[#A78BFA] fill-[#A78BFA]" />
                      <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <PlayCircle className="w-5 h-5 text-[#A78BFA]" strokeWidth={2} />
                  )}
                </div>
              );
            })}
          </div>

          {todayActivities.length > 3 && (
            <p className="text-[12px] text-[#9CA3AF] text-center mt-3">
              +{todayActivities.length - 3} more activities to complete
            </p>
          )}
        </div>
      </Link>

      {/* Extra Practice */}
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE7FE] flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-5 h-5 text-[#A78BFA]" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[#0F0F12] leading-tight">Extra Practice & Games</h2>
            <p className="text-[12px] text-[#6B6B75] mt-0.5">Boost your skills with fun activities!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link to={createPageUrl("Learn")}>
            <div className="p-3.5 border border-[#EFEFF2] rounded-xl hover:border-[#E5E5EA] transition-colors h-full">
              <div className="w-9 h-9 rounded-lg bg-[#A78BFA] flex items-center justify-center mb-2.5">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <p className="text-[13px] font-semibold text-[#0F0F12] leading-tight mb-1">Sound Match Game</p>
              <p className="text-[11px] text-[#6B6B75] mb-2">Practice /s/ sounds</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-[11px] font-bold text-[#F59E0B]">+10 pts</span>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("Learn")}>
            <div className="p-3.5 border border-[#EFEFF2] rounded-xl hover:border-[#E5E5EA] transition-colors h-full">
              <div className="w-9 h-9 rounded-lg border border-[#EFEFF2] bg-white flex items-center justify-center mb-2.5">
                <Star className="w-4 h-4 text-[#A78BFA]" strokeWidth={2.25} />
              </div>
              <p className="text-[13px] font-semibold text-[#0F0F12] leading-tight mb-1">Sentence Builder</p>
              <p className="text-[11px] text-[#6B6B75] mb-2">Build complex sentences</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-[11px] font-bold text-[#F59E0B]">+15 pts</span>
              </div>
            </div>
          </Link>
        </div>

        <Link to={createPageUrl("Learn")}>
          <button className="w-full py-3 bg-[#A78BFA] hover:bg-[#9275F5] text-white text-[14px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            View All Practice Games
          </button>
        </Link>
      </div>

      {/* My Therapy Goals */}
      <Link to={createPageUrl("Progress")} className="block">
        <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5 hover:border-[#E5E5EA] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#A78BFA]" strokeWidth={2.25} />
              <h2 className="text-[17px] font-semibold text-[#0F0F12]">My Therapy Goals</h2>
            </div>
            <span className="text-[12px] font-semibold text-[#A78BFA] flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[14px] font-semibold text-[#0F0F12]">/r/ Sound Accuracy</p>
                <span className="text-[15px] font-bold text-[#A78BFA]">78%</span>
              </div>
              <div className="h-1.5 bg-[#F1F1F4] rounded-full overflow-hidden">
                <div className="h-full bg-[#A78BFA] rounded-full" style={{ width: '78%' }} />
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-1.5">Target: 90% accuracy by March 2026</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[14px] font-semibold text-[#0F0F12]">Sentence Complexity</p>
                <span className="text-[15px] font-bold text-[#A78BFA]">65%</span>
              </div>
              <div className="h-1.5 bg-[#F1F1F4] rounded-full overflow-hidden">
                <div className="h-full bg-[#A78BFA] rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-1.5">Target: 7-word sentences consistently</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}