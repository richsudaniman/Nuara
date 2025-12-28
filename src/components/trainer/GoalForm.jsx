import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function GoalForm({ clientId, trainerId, existingGoal, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(existingGoal || {
    goal_title: "",
    target_value: "",
    current_value: "",
    target_date: "",
    progress_percentage: 0,
    linked_metric_type: "",
    is_active: true,
  });

  const metricTypes = [
    { value: "weight", label: "Weight" },
    { value: "body_fat", label: "Body Fat %" },
    { value: "muscle_mass", label: "Muscle Mass" },
    { value: "chest", label: "Chest" },
    { value: "waist", label: "Waist" },
    { value: "hips", label: "Hips" },
    { value: "arms", label: "Arms" },
    { value: "legs", label: "Legs" },
    { value: "max_bench", label: "Max Bench" },
    { value: "max_squat", label: "Max Squat" },
    { value: "max_deadlift", label: "Max Deadlift" },
  ];

  const saveGoalMutation = useMutation({
    mutationFn: async (data) => {
      const goalData = {
        ...data,
        assigned_to_client_id: clientId,
        created_by_trainer_id: trainerId,
      };

      if (existingGoal?.id) {
        return base44.entities.FitnessGoal.update(existingGoal.id, goalData);
      } else {
        return base44.entities.FitnessGoal.create(goalData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientGoals'] });
      onClose();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveGoalMutation.mutateAsync(formData);
  };

  return (
    <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black italic text-[#1a1a1a] text-lg">
            {existingGoal ? 'EDIT GOAL' : 'NEW GOAL'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Goal Title</label>
            <Input
              placeholder="e.g., Lose 20 lbs, Bench 225 lbs"
              value={formData.goal_title}
              onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
              className="bg-white border-gray-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Current Value</label>
              <Input
                placeholder="e.g., 200 lbs"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                className="bg-white border-gray-300"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Target Value</label>
              <Input
                placeholder="e.g., 180 lbs"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                className="bg-white border-gray-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Target Date</label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="bg-white border-gray-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Progress %</label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseFloat(e.target.value) || 0 })}
                className="bg-white border-gray-300"
              />
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
              disabled={saveGoalMutation.isPending}
              className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
            >
              {saveGoalMutation.isPending ? 'Saving...' : (existingGoal ? 'Update Goal' : 'Create Goal')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}