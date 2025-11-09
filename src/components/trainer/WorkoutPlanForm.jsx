import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export default function WorkoutPlanForm({ clientId, trainerId, existingPlan, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(existingPlan || {
    day_of_week: "Monday",
    workout_type: "",
    exercises: [{ name: "", reps: 10, sets: 3, notes: "", video_url: "" }],
    order: 1,
  });

  const savePlanMutation = useMutation({
    mutationFn: async (data) => {
      const planData = {
        ...data,
        assigned_to_client_id: clientId,
        created_by_trainer_id: trainerId,
      };

      if (existingPlan?.id) {
        return base44.entities.WorkoutPlan.update(existingPlan.id, planData);
      } else {
        return base44.entities.WorkoutPlan.create(planData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientWorkoutPlans'] });
      onClose();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await savePlanMutation.mutateAsync(formData);
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: "", reps: 10, sets: 3, notes: "", video_url: "" }]
    });
  };

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black italic text-[#1a1a1a] text-lg">
            {existingPlan ? 'EDIT WORKOUT PLAN' : 'NEW WORKOUT PLAN'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Day</label>
              <Select value={formData.day_of_week} onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Workout Type</label>
              <Input
                placeholder="e.g., Push Day"
                value={formData.workout_type}
                onChange={(e) => setFormData({ ...formData, workout_type: e.target.value })}
                className="bg-white border-gray-300"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase">Exercises</label>
              <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                <Plus className="w-4 h-4 mr-1" />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="bg-gray-50 p-3 border border-gray-200 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="space-y-2 pr-8">
                    <Input
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="bg-white border-gray-300"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                        className="bg-white border-gray-300"
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                        className="bg-white border-gray-300"
                        required
                      />
                    </div>

                    <Textarea
                      placeholder="Notes (optional)"
                      value={exercise.notes}
                      onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                      className="bg-white border-gray-300 h-16"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={savePlanMutation.isPending}
              className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
            >
              {savePlanMutation.isPending ? 'Saving...' : (existingPlan ? 'Update Plan' : 'Create Plan')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}