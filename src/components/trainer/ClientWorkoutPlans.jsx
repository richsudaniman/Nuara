
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutPlanForm from "./WorkoutPlanForm";

export default function ClientWorkoutPlans({ clientId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: workoutPlans, isLoading } = useQuery({
    queryKey: ['clientWorkoutPlans', clientId],
    queryFn: () => base44.entities.WorkoutPlan.filter({ assigned_to_client_id: clientId }, 'order'),
    initialData: [],
    enabled: !!clientId,
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => base44.entities.WorkoutPlan.delete(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientWorkoutPlans'] });
    },
  });

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    if (confirm('Are you sure you want to delete this workout plan?')) {
      await deletePlanMutation.mutateAsync(planId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black italic text-[#1a1a1a] text-lg">WORKOUT PLANS</h3>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {showForm && (
        <WorkoutPlanForm
          clientId={clientId}
          trainerId={user?.id}
          existingPlan={editingPlan}
          onClose={handleFormClose}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
        </div>
      ) : workoutPlans.length > 0 ? (
        <div className="space-y-3">
          {daysOfWeek.map((day, index) => {
            const plan = workoutPlans.find(p => p.day_of_week === day);
            
            return (
              <Card key={day} className={`${plan ? 'bg-white border-2 border-gray-200 hover:border-[#0ea5e9]' : 'bg-gray-50 border-2 border-dashed border-gray-300'} transition-colors`}>
                <CardContent className="p-5">
                  {plan ? (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-black italic text-[#1a1a1a] text-lg">{day}</h4>
                          <p className="text-sm text-gray-600 font-semibold">{plan.workout_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="text-gray-600 hover:text-[#0ea5e9]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plan.exercises?.map((exercise, index) => (
                          <div key={index} className="bg-gray-50 p-3 border-l-4 border-[#0ea5e9]">
                            <p className="font-bold italic text-[#1a1a1a]">{exercise.name}</p>
                            <p className="text-sm text-gray-600">
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                            {exercise.notes && (
                              <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <h4 className="font-black italic text-gray-400 text-lg mb-2">{day}</h4>
                      <p className="text-sm text-gray-400 mb-3">Rest Day / No Workout Planned</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPlan({ day_of_week: day, workout_type: "", exercises: [{ name: "", reps: 10, sets: 3, notes: "" }], order: index + 1 });
                          setShowForm(true);
                        }}
                        className="text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Workout
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          <p className="mb-4">No workout plans created yet.</p>
          <p className="text-sm">Click "Add Plan" above or use the buttons below to schedule workouts for each day.</p>
        </div>
      )}
    </div>
  );
}
