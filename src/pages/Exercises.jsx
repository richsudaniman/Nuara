import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle, Circle, Play, Info } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function Exercises() {
  const queryClient = useQueryClient();
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  // Mock therapy data for demo
  const mockWeeklyPlan = {
    Monday: { 
      day_of_week: "Monday",
      program_type: "Articulation Practice - /s/ Sound",
      exercises: [
        { name: "🎤 Record /s/ Words (Initial)", reps: 10, notes: "Record yourself saying: 'sun', 'sit', 'sand', 'soap', 'sock' clearly. Listen back and compare." },
        { name: "🎤 Record /s/ Words (Medial)", reps: 10, notes: "Record: 'basket', 'listen', 'castle', 'pencil'. Focus on clarity." },
        { name: "🎧 Minimal Pairs Listening", reps: 8, notes: "Listen and repeat: 'sink/think', 'sum/thumb', 'sank/thank'" },
        { name: "🎤 Record Sentence Practice", reps: 5, notes: "Record: 'I saw the sun.' Repeat 5 times, improving each time." }
      ]
    },
    Tuesday: {
      day_of_week: "Tuesday",
      program_type: "Language & Sentence Building",
      exercises: [
        { name: "🎤 Record Complex Sentences", reps: 5, notes: "Record yourself creating 6-8 word sentences about your day" },
        { name: "🎧 Listen & Describe", reps: 10, notes: "Listen to the audio prompt, then describe what you heard in detail" },
        { name: "🎤 Category Naming Game", reps: 15, notes: "Record yourself naming: Animals, Foods, Clothing. Set a timer for 1 minute each!" },
        { name: "📝 Story Sequencing", reps: 3, notes: "Record yourself telling a story with beginning, middle, and end" }
      ]
    },
    Wednesday: {
      day_of_week: "Wednesday",
      program_type: "Fluency & Voice Control",
      exercises: [
        { name: "🎤 Slow Speech Recording", reps: 10, notes: "Record sentences slowly. Play back at normal speed to hear clarity." },
        { name: "🫁 Breathing + Speaking", reps: 5, notes: "Take a deep breath, then speak one sentence smoothly" },
        { name: "🎤 Easy Onset Practice", reps: 8, notes: "Record words starting gently: 'apple', 'ocean', 'under', 'every'" },
        { name: "🎧 Rhythm & Pacing", reps: 1, notes: "Listen to sample speech, match the rhythm and pace" }
      ]
    },
    Thursday: {
      day_of_week: "Thursday",
      program_type: "Articulation Practice - /r/ Sound",
      exercises: [
        { name: "🎤 Record /r/ Words", reps: 12, notes: "Record clearly: 'red', 'run', 'road', 'rabbit', 'rain', 'ring'" },
        { name: "🎤 /r/ in Phrases", reps: 8, notes: "Record phrases: 'red rabbit', 'run on the road', 'rain and rivers'" },
        { name: "🎧 Compare & Contrast", reps: 5, notes: "Listen to correct /r/ production, then record your own and compare" },
        { name: "🎤 /r/ Sentence Challenge", reps: 5, notes: "Record: 'The rabbit ran across the road in the rain.'" }
      ]
    },
    Friday: {
      day_of_week: "Friday",
      program_type: "Listening & Comprehension",
      exercises: [
        { name: "🎧 Story Retelling", reps: 1, notes: "Listen to the story audio. Then record yourself retelling it." },
        { name: "🎤 Answer Questions", reps: 10, notes: "Listen to questions, record your answers: 'who, what, where, when, why'" },
        { name: "🎧 Sound Detective", reps: 15, notes: "Listen to words. Identify target sounds /s/ and /r/. Record which sound you hear." },
        { name: "🎤 Weekly Recap", reps: 1, notes: "Record a summary: What did you practice this week? How do you feel about your progress?" }
      ]
    },
    Saturday: {
      day_of_week: "Saturday",
      program_type: "Conversation Practice",
      exercises: [
        { name: "🎤 Free Talk Recording", reps: 1, notes: "Record 2 minutes talking about your favorite hobby or activity" },
        { name: "🎤 Phone Call Simulation", reps: 3, notes: "Practice and record ordering food, asking for directions, making appointments" }
      ]
    },
    Sunday: {
      day_of_week: "Sunday",
      program_type: "Review & Reflection",
      exercises: [
        { name: "🎧 Listen to Your Week", reps: 1, notes: "Review your recordings from this week. Notice your improvements!" },
        { name: "🎤 Self-Assessment", reps: 1, notes: "Record: What sounds are easier now? What do you want to work on?" }
      ]
    }
  };

  // First check WorkoutPlan, then RehabilitationProgram
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ['programs', user?.id],
    queryFn: async () => {
      // Try new RehabilitationProgram first
      try {
        const rehabPrograms = await base44.entities.RehabilitationProgram.filter({ assigned_to_patient_id: user.id }, 'order');
        if (rehabPrograms.length > 0) return rehabPrograms;
      } catch (e) {
        console.log('RehabilitationProgram not available, falling back to WorkoutPlan');
      }
      
      // Fallback to old WorkoutPlan
      const workoutPlans = await base44.entities.WorkoutPlan.filter({ assigned_to_client_id: user.id }, 'order');
      return workoutPlans;
    },
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
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

  const selectedProgram = programs.find(p => p.day_of_week === selectedDay) || mockWeeklyPlan[selectedDay];
  const todayDate = new Date().toISOString().split('T')[0];
  const hasRealData = programs.length > 0;

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

  const isLoading = programsLoading || logsLoading;

  return (
    <div className="p-5 space-y-5 bg-gradient-to-b from-purple-50/30 via-blue-50/20 to-white min-h-screen">
          <h1 className="text-2xl font-bold text-gray-900">MY THERAPY HOMEWORK</h1>

      {isLoading ? (
        <>
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No Therapy Activities Yet"
          description="Your speech therapist will assign your personalized therapy homework soon."
          variant="info"
        />
      ) : (
        <>
          {/* Weekly Schedule */}
          <Card className="bg-white border-purple-100 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">THIS WEEK'S THERAPY PLAN</h3>
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => {
                  const hasProgram = programs.some(p => p.day_of_week === day) || mockWeeklyPlan[day];
                  const isToday = day === today;
                  const isSelected = day === selectedDay;
                  const dayLogs = logs.filter(log => {
                    const program = programs.find(p => p.day_of_week === day);
                    return log.completed_date === todayDate && log.workout_plan_id === program?.id;
                  });
                  // Mock completion for Monday and Tuesday for demo
                  const isCompleted = (hasProgram && dayLogs.length > 0) || (!hasRealData && (day === 'Monday' || day === 'Tuesday'));

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`p-2 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-md'
                          : hasProgram
                          ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div className="text-[10px] mb-1">{day.slice(0, 3)}</div>
                      {isCompleted && <CheckCircle className="w-3 h-3 mx-auto text-green-500" />}
                      {!isCompleted && hasProgram && <Circle className="w-3 h-3 mx-auto opacity-30" />}
                      {!hasProgram && <span className="text-[8px]">REST</span>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Activities */}
          {selectedProgram ? (
            <Card className="bg-white border-blue-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedProgram.program_type || selectedProgram.workout_type}</h3>
                    <p className="text-sm text-gray-500">{selectedDay}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {selectedProgram.exercises?.length || 0} activities
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedProgram.exercises?.map((exercise, idx) => {
                    const isCompleted = logs.some(log =>
                      log.completed_date === todayDate &&
                      log.exercise_name === exercise.name &&
                      log.workout_plan_id === selectedProgram.id
                    );

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-r from-green-50 to-teal-50 border-green-200'
                              : 'bg-white border-gray-200'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => !isCompleted && handleExerciseComplete(exercise)}
                            disabled={isCompleted || logExerciseMutation.isPending}
                            className="mt-1 flex-shrink-0"
                            >
                            {isCompleted ? (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full border-3 border-gray-300 bg-white shadow-sm hover:border-purple-400 transition-colors cursor-pointer" />
                            )}
                            </button>

                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{exercise.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                              {exercise.reps && <span>Repeat {exercise.reps} times</span>}
                              {exercise.sets && <span>{exercise.sets} rounds</span>}
                              {exercise.hold_duration && <span>Hold {exercise.hold_duration}s</span>}
                            </div>
                            {exercise.notes && (
                              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{exercise.notes}</p>
                            )}
                          </div>

                          {exercise.video_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedVideo(exercise)}
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Activity}
              title="No Activities Today"
              description={`No therapy homework scheduled for ${selectedDay}. Take a break and relax!`}
              variant="success"
            />
          )}
        </>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selectedVideo.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)}>
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-black">
              <video src={selectedVideo.video_url} controls autoPlay className="w-full h-full" />
            </div>
            {selectedVideo.notes && (
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">{selectedVideo.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}