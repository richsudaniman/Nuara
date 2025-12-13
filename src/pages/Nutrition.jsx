import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MealPlanCard from "../components/nutrition/MealPlanCard";
import CalorieTracker from "../components/nutrition/CalorieTracker";
import FoodPhotoAnalyzer from "../components/nutrition/FoodPhotoAnalyzer";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../components/EmptyState";
import { UtensilsCrossed } from "lucide-react";

export default function Nutrition() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: meals, isLoading: mealsLoading } = useQuery({
    queryKey: ['meals', user?.id],
    queryFn: () => base44.entities.NutritionPlan.filter({ assigned_to_client_id: user.id }, 'order'),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: calorieLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['calorieLogs', user?.id],
    queryFn: () => base44.entities.CalorieLog.filter({ logged_by_client_id: user.id }, '-created_date'),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const addLogMutation = useMutation({
    mutationFn: (logData) => base44.entities.CalorieLog.create({
      ...logData,
      logged_by_client_id: user.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calorieLogs'] });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (logId) => base44.entities.CalorieLog.delete(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calorieLogs'] });
    },
  });

  const isLoading = mealsLoading || logsLoading;

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-5 left-5 w-16 h-16 border-2 border-gray-200" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}></div>
      
      {isLoading ? (
        <>
          <Skeleton className="h-96 rounded-lg bg-gray-100" />
          <Skeleton className="h-96 rounded-lg bg-gray-100" />
        </>
      ) : (
        <>
          {meals.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No Meal Plan Yet"
              description="Your trainer hasn't created a nutrition plan for you yet. Check back soon!"
              variant="info"
            />
          ) : (
            <MealPlanCard meals={meals} />
          )}
          
          <FoodPhotoAnalyzer 
            onFoodAnalyzed={(data) => addLogMutation.mutate(data)}
          />
          
          <CalorieTracker
            logs={calorieLogs}
            onAddLog={(data) => addLogMutation.mutate(data)}
            onDeleteLog={(id) => deleteLogMutation.mutate(id)}
            dailyTarget={user?.daily_calorie_target || 2200}
            proteinTarget={user?.daily_protein_target || 150}
            carbsTarget={user?.daily_carbs_target || 250}
            fatsTarget={user?.daily_fats_target || 70}
          />
        </>
      )}
    </div>
  );
}