import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle2, Play, Heart, Mic } from "lucide-react";
import EmptyState from "../components/EmptyState";
import AssignmentDetailDialog from "../components/exercises/AssignmentDetailDialog";

export default function Exercises() {
  const queryClient = useQueryClient();
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openExercise, setOpenExercise] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  // Mock therapy data for demo
  const mockWeeklyPlan = {
    Monday: {
      day_of_week: "Monday",
      program_type: "Articulation Practice — /s/ Sound",
      exercises: [
        { name: "Record /s/ Words (Initial)", reps: 10, notes: "Record yourself saying: 'sun', 'sit', 'sand', 'soap', 'sock' clearly. Listen back and compare." },
        { name: "Record /s/ Words (Medial)", reps: 10, notes: "Record: 'basket', 'listen', 'castle', 'pencil'. Focus on clarity." },
        { name: "Minimal Pairs Listening", reps: 8, notes: "Listen and repeat: 'sink/think', 'sum/thumb', 'sank/thank'" },
        { name: "Record Sentence Practice", reps: 5, notes: "Record: 'I saw the sun.' Repeat 5 times, improving each time." }
      ]
    },
    Tuesday: {
      day_of_week: "Tuesday",
      program_type: "Language & Sentence Building",
      exercises: [
        { name: "Record Complex Sentences", reps: 5, notes: "Record yourself creating 6-8 word sentences about your day" },
        { name: "Listen & Describe", reps: 10, notes: "Listen to the audio prompt, then describe what you heard in detail" },
        { name: "Category Naming Game", reps: 15, notes: "Record yourself naming: Animals, Foods, Clothing. Set a timer for 1 minute each!" },
        { name: "Story Sequencing", reps: 3, notes: "Record yourself telling a story with beginning, middle, and end" }
      ]
    },
    Wednesday: {
      day_of_week: "Wednesday",
      program_type: "Fluency & Voice Control",
      exercises: [
        { name: "Slow Speech Recording", reps: 10, notes: "Record sentences slowly. Play back at normal speed to hear clarity." },
        { name: "Breathing + Speaking", reps: 5, notes: "Take a deep breath, then speak one sentence smoothly" },
        { name: "Easy Onset Practice", reps: 8, notes: "Record words starting gently: 'apple', 'ocean', 'under', 'every'" },
        { name: "Rhythm & Pacing", reps: 1, notes: "Listen to sample speech, match the rhythm and pace" }
      ]
    },
    Thursday: {
      day_of_week: "Thursday",
      program_type: "Articulation Practice — /r/ Sound",
      exercises: [
        { name: "Record /r/ Words", reps: 12, notes: "Record clearly: 'red', 'run', 'road', 'rabbit', 'rain', 'ring'" },
        { name: "/r/ in Phrases", reps: 8, notes: "Record phrases: 'red rabbit', 'run on the road', 'rain and rivers'" },
        { name: "Compare & Contrast", reps: 5, notes: "Listen to correct /r/ production, then record your own and compare" },
        { name: "/r/ Sentence Challenge", reps: 5, notes: "Record: 'The rabbit ran across the road in the rain.'" }
      ]
    },
    Friday: {
      day_of_week: "Friday",
      program_type: "Listening & Comprehension",
      exercises: [
        { name: "Story Retelling", reps: 1, notes: "Listen to the story audio. Then record yourself retelling it." },
        { name: "Answer Questions", reps: 10, notes: "Listen to questions, record your answers: 'who, what, where, when, why'" },
        { name: "Sound Detective", reps: 15, notes: "Listen to words. Identify target sounds /s/ and /r/." },
        { name: "Weekly Recap", reps: 1, notes: "Record a summary: What did you practice this week?" }
      ]
    },
    Saturday: {
      day_of_week: "Saturday",
      program_type: "Conversation Practice",
      exercises: [
        { name: "Free Talk Recording", reps: 1, notes: "Record 2 minutes talking about your favorite hobby or activity" },
        { name: "Phone Call Simulation", reps: 3, notes: "Practice and record ordering food, asking for directions, making appointments" }
      ]
    },
    Sunday: {
      day_of_week: "Sunday",
      program_type: "Review & Reflection",
      exercises: [
        { name: "Listen to Your Week", reps: 1, notes: "Review your recordings from this week. Notice your improvements!" },
        { name: "Self-Assessment", reps: 1, notes: "Record: What sounds are easier now? What do you want to work on?" }
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

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-5 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[26px] font-bold text-[#0F0F12] tracking-tight leading-tight">My Therapy</h1>
        <p className="text-[14px] text-[#6B6B75]">Tap any activity for instructions and to send a voice memo.</p>
      </div>

      {/* Weekly schedule */}
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-4">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-3">This week</p>
        <div className="grid grid-cols-7 gap-1.5">
          {daysOfWeek.map(day => {
            const hasProgram = mockWeeklyPlan[day];
            const isSelected = day === selectedDay;
            const isCompleted = (day === 'Monday' || day === 'Tuesday');

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center py-2.5 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-[#A78BFA] text-white'
                    : hasProgram
                    ? 'bg-[#FAFAFB] hover:bg-[#F5F5F7] text-[#0F0F12]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-[#9CA3AF]'}`}>{day.slice(0, 3)}</span>
                <div className="mt-1 h-1.5 w-1.5 flex items-center justify-center">
                  {isCompleted && !isSelected && <div className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]" />}
                  {isCompleted && isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's program */}
      {selectedProgram ? (
        <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">{selectedDay}</p>
              <h2 className="text-[17px] font-semibold text-[#0F0F12] leading-tight">{selectedProgram.program_type}</h2>
            </div>
            <span className="text-[12px] font-medium text-[#6B6B75] flex-shrink-0 ml-3">
              {selectedProgram.exercises?.length || 0} activities
            </span>
          </div>

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
                  className="w-full flex items-center gap-3 p-3.5 border border-[#EFEFF2] rounded-xl bg-[#FAFAFB] hover:bg-[#F5F5F7] hover:border-[#E5E5EA] transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-[#EDE7FE]' : 'border border-[#EFEFF2] bg-white'
                  }`}>
                    {isCompleted ? (
                      <Heart className="w-4 h-4 text-[#A78BFA] fill-[#A78BFA]" />
                    ) : (
                      <Mic className="w-4 h-4 text-[#A78BFA]" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0F0F12] truncate">{exercise.name}</p>
                    <div className="flex items-center gap-2 text-[12px] text-[#6B6B75] mt-0.5">
                      {exercise.reps && <span>Repeat {exercise.reps} times</span>}
                      {exercise.sets && <span>· {exercise.sets} sets</span>}
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#A78BFA] flex-shrink-0" strokeWidth={2.25} />
                  ) : (
                    <Play className="w-4 h-4 text-[#A78BFA] flex-shrink-0" strokeWidth={2.25} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No activities today"
          description={`Nothing scheduled for ${selectedDay}. Take a break and relax.`}
          variant="success"
        />
      )}

      {/* Assignment Detail Dialog */}
      <AssignmentDetailDialog
        exercise={openExercise?.exercise}
        isCompleted={openExercise?.isCompleted}
        open={!!openExercise}
        onOpenChange={(o) => !o && setOpenExercise(null)}
        onComplete={() => openExercise && handleExerciseComplete(openExercise.exercise)}
      />

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 border-b border-[#EFEFF2] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F0F12]">{selectedVideo.name}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-[#6B6B75] text-sm">Close</button>
            </div>
            <div className="aspect-video bg-black">
              <video src={selectedVideo.video_url} controls autoPlay className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}