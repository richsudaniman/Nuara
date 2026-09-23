import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DAYS, buildWeek, completionKey } from "@/lib/homeworkDelivery";
import { MOCK_PLANS } from "@/lib/mockWeeklyPlan";
import TherapyHeader from "@/components/exercises/TherapyHeader";
import DaySelector from "@/components/exercises/DaySelector";
import DayProgress from "@/components/exercises/DayProgress";
import ProgramHeader from "@/components/exercises/ProgramHeader";
import ExerciseCard from "@/components/exercises/ExerciseCard";
import AssignmentDetailDialog from "@/components/exercises/AssignmentDetailDialog";

export default function Exercises() {
  const queryClient = useQueryClient();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState(today);
  const [openIndex, setOpenIndex] = useState(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), staleTime: 30 * 60 * 1000 });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["myTherapyPlans", user?.id],
    queryFn: () => base44.entities.TherapyPlan.filter({ assigned_to_client_id: user.id }),
    enabled: !!user?.id,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["exerciseLogs", user?.id],
    queryFn: () => base44.entities.TherapyLog.filter({ logged_by_client_id: user.id }, "-completed_date"),
    enabled: !!user?.id,
  });

  const isDemo = !plansLoading && plans.length === 0;
  const week = useMemo(() => buildWeek(isDemo ? MOCK_PLANS : plans), [isDemo, plans]);
  const activeDays = DAYS.filter((d) => week[d]?.length);
  const day = activeDays.includes(selectedDay) ? selectedDay : activeDays[0];
  const dayPlans = week[day] || [];
  const dayExercises = dayPlans.flatMap((p) => p.exercises);
  const counts = Object.fromEntries(activeDays.map((d) => [d, week[d].reduce((n, p) => n + p.exercises.length, 0)]));

  const doneKeys = new Set(
    logs.filter((l) => l.completed_date === todayDate).map((l) => completionKey(l.workout_plan_id, l.exercise_name, l.completed_date))
  );
  const isDone = (ex) => doneKeys.has(completionKey(ex.planId, ex.name, todayDate));
  const doneCount = dayExercises.filter(isDone).length;

  const openExercise = openIndex != null ? dayExercises[openIndex] : null;
  const nextIndex = openIndex != null ? dayExercises.findIndex((ex, i) => i > openIndex && !isDone(ex)) : -1;

  const handleComplete = async (payload) => {
    const ex = openExercise;
    await base44.entities.TherapyLog.create({
      logged_by_client_id: user.id,
      workout_plan_id: ex.planId || undefined,
      exercise_name: ex.name,
      completed_date: todayDate,
      sets_completed: ex.sets || 0,
      reps_completed: ex.reps || 0,
      modality: payload.modality,
      submission_url: payload.submission_url,
      goal_id: ex.goal_id || undefined,
      metric_type: ex.metric_type || undefined,
      metric_value: payload.metric_value,
      notes: payload.notes,
      session_label: isDemo ? "Sample practice" : undefined,
    });
    queryClient.invalidateQueries({ queryKey: ["exerciseLogs"] });
  };

  if (!user || plansLoading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-2/3 rounded-xl" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-4 py-6 space-y-4 font-body">
      <TherapyHeader firstName={user.full_name?.split(" ")[0]} points={logs.length * 10} isDemo={isDemo} />
      <DaySelector days={activeDays} counts={counts} selected={day} today={today} onSelect={setSelectedDay} />
      <DayProgress done={doneCount} total={dayExercises.length} />

      {dayPlans.map((plan) => (
        <div key={plan.key} className="space-y-2.5">
          <ProgramHeader plan={plan} />
          {plan.exercises.map((ex) => (
            <ExerciseCard key={ex.key} exercise={ex} done={isDone(ex)} onOpen={() => setOpenIndex(dayExercises.indexOf(ex))} />
          ))}
        </div>
      ))}

      <AssignmentDetailDialog
        exercise={openExercise}
        isCompleted={openExercise ? isDone(openExercise) : false}
        open={!!openExercise}
        onOpenChange={(o) => !o && setOpenIndex(null)}
        onComplete={handleComplete}
        hasNext={nextIndex !== -1}
        onNext={() => setOpenIndex(nextIndex)}
      />
    </div>
  );
}