import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import GoalForm from "./GoalForm";
import { format } from "date-fns";

export default function ClientGoals({ clientId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['clientGoals', clientId],
    queryFn: () => base44.entities.FitnessGoal.filter({ assigned_to_client_id: clientId }),
    initialData: [],
    enabled: !!clientId,
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => base44.entities.FitnessGoal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientGoals'] });
    },
  });

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (goalId) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoalMutation.mutateAsync(goalId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const activeGoals = goals.filter(g => g.is_active);
  const completedGoals = goals.filter(g => !g.is_active);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black italic text-[#1a1a1a] text-lg">FITNESS GOALS</h3>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {showForm && (
        <GoalForm
          clientId={clientId}
          trainerId={user?.id}
          existingGoal={editingGoal}
          onClose={handleFormClose}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-600 uppercase">Active Goals</h4>
              {activeGoals.map(goal => (
                <Card key={goal.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-black italic text-[#1a1a1a] text-xl">{goal.goal_title}</h4>
                          <div className="flex items-center gap-1 bg-[#0ea5e9] px-3 py-1 rounded-full ml-3">
                            <Target className="w-4 h-4 text-white" />
                            <span className="text-sm font-black text-white italic">{goal.progress_percentage || 0}%</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          <span className="text-[#0ea5e9] font-bold">{goal.current_value}</span> → <span className="font-bold">{goal.target_value}</span>
                        </p>

                        {goal.target_date && (
                          <p className="text-xs text-gray-500 mb-3">
                            Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </p>
                        )}

                        <Progress value={goal.progress_percentage || 0} className="h-2 bg-gray-200" />
                      </div>

                      <div className="flex flex-col gap-2 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                          className="text-gray-600 hover:text-[#0ea5e9]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-600 uppercase">Completed Goals</h4>
              {completedGoals.map(goal => (
                <Card key={goal.id} className="bg-gray-50 border border-gray-300">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-600 text-sm line-through">{goal.goal_title}</h4>
                        <p className="text-xs text-gray-500">{goal.target_value}</p>
                      </div>
                      <span className="text-green-600 font-bold text-xs">✓ Completed</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <div className="text-center py-12 text-gray-500 italic">
              No goals set yet. Click "Add Goal" to create one.
            </div>
          )}
        </>
      )}
    </div>
  );
}