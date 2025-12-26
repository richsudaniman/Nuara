import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function NutritionPlanForm({ clientId, trainerId, existingPlan, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(existingPlan || {
    meal_name: "",
    description: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    meal_time: "",
    order: 1,
  });

  const savePlanMutation = useMutation({
    mutationFn: async (data) => {
      console.log('=== CREATING NUTRITION PLAN ===');
      console.log('CLIENT ID:', clientId);
      console.log('TRAINER ID:', trainerId);
      const planData = {
        ...data,
        assigned_to_client_id: clientId,
        created_by_trainer_id: trainerId,
      };
      console.log('PLAN DATA TO SAVE:', planData);

      if (existingPlan?.id) {
        return base44.entities.NutritionPlan.update(existingPlan.id, planData);
      } else {
        const result = await base44.entities.NutritionPlan.create(planData);
        console.log('NUTRITION PLAN CREATED:', result);
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientNutritionPlans'] });
      onClose();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await savePlanMutation.mutateAsync(formData);
  };

  return (
    <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black italic text-[#1a1a1a] text-lg">
            {existingPlan ? 'EDIT MEAL' : 'NEW MEAL'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Meal Name</label>
            <Input
              placeholder="e.g., Breakfast, Post-Workout Snack"
              value={formData.meal_name}
              onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
              className="bg-white border-gray-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Description</label>
            <Textarea
              placeholder="Describe the meal or recipe"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white border-gray-300 h-20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Meal Time</label>
              <Input
                type="time"
                value={formData.meal_time}
                onChange={(e) => setFormData({ ...formData, meal_time: e.target.value })}
                className="bg-white border-gray-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Calories</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                className="bg-white border-gray-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Protein (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                className="bg-white border-gray-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Carbs (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                className="bg-white border-gray-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Fats (g)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) || 0 })}
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
              disabled={savePlanMutation.isPending}
              className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
            >
              {savePlanMutation.isPending ? 'Saving...' : (existingPlan ? 'Update Meal' : 'Create Meal')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}