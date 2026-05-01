import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, CheckCircle2, Play, Mic, Sparkles, Star } from "lucide-react";
import EmptyState from "../components/EmptyState";
import AssignmentDetailDialog from "../components/exercises/AssignmentDetailDialog";

export default function Exercises() {
  const queryClient = useQueryClient();
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(today);
  const [openExercise, setOpenExercise] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  // Mock therapy data with kid-friendly emojis
  const mockWeeklyPlan = {
    Monday: {
      day_of_week: "Monday",
      program_type: "Snake Sounds — /s/",
      emoji: "🐍",
      color: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
      exercises: [
        { name: "Say snake words!", emoji: "🌞", reps: 10, notes: "Record yourself saying: 'sun', 'sit', 'sand', 'soap', 'sock' clearly. Listen back and compare." },
        { name: "Hidden /s/ sounds", emoji: "🎒", reps: 10, notes: "Record: 'basket', 'listen', 'castle', 'pencil'. Focus on clarity." },
        { name: "Listen and repeat", emoji: "👂", reps: 8, notes: "Listen and repeat: 'sink/think', 'sum/thumb', 'sank/thank'" },
        { name: "Sentence superstar", emoji: "⭐", reps: 5, notes: "Record: 'I saw the sun.' Repeat 5 times, improving each time." }
      ]
    },
    Tuesday: {
      day_of_week: "Tuesday",
      program_type: "Sentence Builder",
      emoji: "🧩",
      color: "bg-[#DBEAFE]",
      iconColor: "text-[#3B82F6]",
      exercises: [
        { name: "Big sentence challenge", emoji: "💬", reps: 5, notes: "Record yourself creating 6-8 word sentences about your day" },
        { name: "Listen & describe", emoji: "🔍", reps: 10, notes: "Listen to the audio prompt, then describe what you heard in detail" },
        { name: "Speed naming game", emoji: "⚡", reps: 15, notes: "Record yourself naming: Animals, Foods, Clothing. Set a timer for 1 minute each!" },
        { name: "Tell a story", emoji: "📖", reps: 3, notes: "Record yourself telling a story with beginning, middle, and end" }
      ]
    },
    Wednesday: {
      day_of_week: "Wednesday",
      program_type: "Smooth Talking",
      emoji: "🌊",
      color: "bg-[#CFFAFE]",
      iconColor: "text-[#0891B2]",
      exercises: [
        { name: "Slow & steady", emoji: "🐢", reps: 10, notes: "Record sentences slowly. Play back at normal speed to hear clarity." },
        { name: "Big breath, big words", emoji: "🌬️", reps: 5, notes: "Take a deep breath, then speak one sentence smoothly" },
        { name: "Gentle starts", emoji: "🍃", reps: 8, notes: "Record words starting gently: 'apple', 'ocean', 'under', 'every'" },
        { name: "Find the rhythm", emoji: "🥁", reps: 1, notes: "Listen to sample speech, match the rhythm and pace" }
      ]
    },
    Thursday: {
      day_of_week: "Thursday",
      program_type: "Roaring /r/ Sounds",
      emoji: "🦁",
      color: "bg-[#FED7AA]",
      iconColor: "text-[#EA580C]",
      exercises: [
        { name: "Rrrrr words!", emoji: "🐰", reps: 12, notes: "Record clearly: 'red', 'run', 'road', 'rabbit', 'rain', 'ring'" },
        { name: "Rabbit phrases", emoji: "🌧️", reps: 8, notes: "Record phrases: 'red rabbit', 'run on the road', 'rain and rivers'" },
        { name: "Compare & cheer", emoji: "🎯", reps: 5, notes: "Listen to correct /r/ production, then record your own and compare" },
        { name: "Super sentence", emoji: "🌟", reps: 5, notes: "Record: 'The rabbit ran across the road in the rain.'" }
      ]
    },
    Friday: {
      day_of_week: "Friday",
      program_type: "Detective Listening",
      emoji: "🕵️",
      color: "bg-[#EDE9FE]",
      iconColor: "text-[#7C3AED]",
      exercises: [
        { name: "Story time", emoji: "📚", reps: 1, notes: "Listen to the story audio. Then record yourself retelling it." },
        { name: "Question quest", emoji: "❓", reps: 10, notes: "Listen to questions, record your answers: 'who, what, where, when, why'" },
        { name: "Sound detective", emoji: "🔎", reps: 15, notes: "Listen to words. Identify target sounds /s/ and /r/." },
        { name: "Weekly recap", emoji: "🏆", reps: 1, notes: "Record a summary: What did you practice this week?" }
      ]
    },
    Saturday: {
      day_of_week: "Saturday",
      program_type: "Chat Time",
      emoji: "💬",
      color: "bg-[#FCE7F3]",
      iconColor: "text-[#DB2777]",
      exercises: [
        { name: "Tell me about it!", emoji: "🎤", reps: 1, notes: "Record 2 minutes talking about your favorite hobby or activity" },
        { name: "Pretend phone call", emoji: "📞", reps: 3, notes: "Practice and record ordering food, asking for directions, making appointments" }
      ]
    },
    Sunday: {
      day_of_week: "Sunday",
      program_type: "Look How Far You've Come!",
      emoji: "🎉",
      color: "bg-[#D1FAE5]",
      iconColor: "text-[#059669]",
      exercises: [
        { name: "Listen to your week", emoji: "🎧", reps: 1, notes: "Review your recordings from this week. Notice your improvements!" },
        { name: "Reflect & cheer", emoji: "💫", reps: 1, notes: "Record: What sounds are easier now? What do you want to work on?" }
      ]
    }
  };

  const { data: logs } = useQuery({
    queryKey: ['exerciseLogs', user?.id],
    queryFn: () => base44.entities.WorkoutLog.filter({ logged_by_client_id: user.id }, '-completed_date'),
    initialData: [],
    enabled: !!user?.id,
  });

  const logExerciseMutation = useMutation({
    mutationFn: (exerciseData) => base44.entities.WorkoutLog.create(exerciseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseLogs'] });
    },
  });

  const selectedProgram = mockWeeklyPlan[selectedDay];
  const todayDate = new Date().toISOString().split('T')[0];

  const handleExerciseComplete = async (exercise) => {
    await logExerciseMutation.mutateAsync({
      logged_by_client_id: user.id,
      workout_plan_id: selectedProgram.id,
      exercise_name: exercise.name,
      completed_date: todayDate,
      sets_completed: exercise.sets || 0,
      reps_completed: exercise.reps || 0,
    });
  };

  const completedCount = selectedProgram?.exercises?.filter(ex =>
    logs.some(log => log.completed_date === todayDate && log.exercise_name === ex.name)
  ).length || 0;
  const totalCount = selectedProgram?.exercises?.length || 0;

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-5 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-bold text-[#0F0F12] tracking-tight leading-tight flex items-center gap-2">
          My Therapy <span>🎯</span>
        </h1>
        <p className="text-[14px] text-[#6B6B75]">Tap a fun activity to get started!</p>
      </div>

      {/* Weekly schedule */}
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-4">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-3">This week</p>
        <div className="grid grid-cols-7 gap-1.5">
          {daysOfWeek.map(day => {
            const program = mockWeeklyPlan[day];
            const isSelected = day === selectedDay;
            const isToday = day === today;
            const isCompleted = (day === 'Monday' || day === 'Tuesday');

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center py-2.5 rounded-xl transition-colors relative ${
                  isSelected
                    ? 'bg-[#A78BFA] text-white'
                    : 'bg-[#FAFAFB] hover:bg-[#F5F5F7] text-[#0F0F12]'
                }`}
              >
                {isToday && !isSelected && (
                  <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-[#A78BFA] ring-2 ring-white" />
                )}
                <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-[#9CA3AF]'}`}>{day.slice(0, 3)}</span>
                <span className="text-base mt-0.5 leading-none">{program?.emoji}</span>
                <div className="mt-1 h-1 flex items-center justify-center">
                  {isCompleted && <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#A78BFA]'}`} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's program */}
      {selectedProgram ? (
        <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-12 h-12 ${selectedProgram.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl`}>
              {selectedProgram.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em]">{selectedDay}</p>
              <h2 className="text-[18px] font-bold text-[#0F0F12] leading-tight">{selectedProgram.program_type}</h2>
            </div>
          </div>

          {/* Progress pill */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2.5 mb-4 p-3 bg-[#FAFAFB] border border-[#EFEFF2] rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-semibold text-[#0F0F12]">
                    {completedCount === totalCount && totalCount > 0
                      ? "Amazing! All done! 🎉"
                      : completedCount === 0
                      ? "Let's get started! 🚀"
                      : `Keep going, you got this! 💪`}
                  </span>
                  <span className="text-[12px] font-bold text-[#A78BFA]">{completedCount}/{totalCount}</span>
                </div>
                <div className="h-1.5 bg-[#F1F1F4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A78BFA] rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {selectedProgram.exercises?.map((exercise, idx) => {
              const isCompleted = logs.some(log =>
                log.completed_date === todayDate &&
                log.exercise_name === exercise.name
              );

              return (
                <button
                  key={idx}
                  onClick={() => setOpenExercise({ exercise, isCompleted })}
                  className={`w-full flex items-center gap-3 p-3.5 border rounded-2xl text-left transition-all ${
                    isCompleted
                      ? 'border-[#EDE7FE] bg-[#F8F5FF]'
                      : 'border-[#EFEFF2] bg-[#FAFAFB] hover:bg-[#F5F5F7] hover:border-[#E5E5EA] active:scale-[0.99]'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl ${
                    isCompleted ? 'bg-[#EDE7FE]' : 'bg-white border border-[#EFEFF2]'
                  }`}>
                    {exercise.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold leading-tight ${isCompleted ? 'text-[#A78BFA]' : 'text-[#0F0F12]'}`}>
                      {exercise.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6B6B75] mt-1">
                      <Mic className="w-3 h-3" strokeWidth={2.25} />
                      <span>{exercise.reps} times</span>
                      {isCompleted && (
                        <>
                          <span className="text-[#D1D1D6]">·</span>
                          <span className="text-[#A78BFA] font-semibold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                            +10 pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-[#A78BFA] flex-shrink-0" strokeWidth={2.25} />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#A78BFA] flex items-center justify-center flex-shrink-0">
                      <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Encouragement footer */}
          {completedCount === totalCount && totalCount > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border border-[#FEF3C7] rounded-2xl flex items-center gap-3">
              <span className="text-3xl">🌟</span>
              <div>
                <p className="text-[14px] font-bold text-[#0F0F12]">You did it!</p>
                <p className="text-[12px] text-[#6B6B75]">Your therapist will be so proud of you!</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="Rest day! 😴"
          description={`Nothing scheduled for ${selectedDay}. You earned a break!`}
          variant="success"
        />
      )}

      {/* Tip card */}
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EDE7FE] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#A78BFA]" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#0F0F12]">Pro tip</p>
          <p className="text-[12px] text-[#6B6B75]">Practice in front of a mirror — it really helps!</p>
        </div>
      </div>

      {/* Assignment Detail Dialog */}
      <AssignmentDetailDialog
        exercise={openExercise?.exercise}
        isCompleted={openExercise?.isCompleted}
        open={!!openExercise}
        onOpenChange={(o) => !o && setOpenExercise(null)}
        onComplete={() => openExercise && handleExerciseComplete(openExercise.exercise)}
      />
    </div>
  );
}