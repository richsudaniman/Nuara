import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Save, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [goals, setGoals] = useState({
    daily_calorie_target: user?.daily_calorie_target || 2200,
    daily_protein_target: user?.daily_protein_target || 150,
    daily_carbs_target: user?.daily_carbs_target || 250,
    daily_fats_target: user?.daily_fats_target || 70,
  });

  React.useEffect(() => {
    if (user) {
      setGoals({
        daily_calorie_target: user.daily_calorie_target || 2200,
        daily_protein_target: user.daily_protein_target || 150,
        daily_carbs_target: user.daily_carbs_target || 250,
        daily_fats_target: user.daily_fats_target || 70,
      });
    }
  }, [user]);

  const updateGoalsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const handleSave = () => {
    updateGoalsMutation.mutate(goals);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-5">
        <Skeleton className="h-96 rounded-lg bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-5 right-5 w-16 h-16 border-2 border-[#0ea5e9]/20 rotate-12"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#0ea5e9] flex items-center justify-center" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">NUTRITION GOALS</h1>
          <p className="text-sm text-gray-600">Set your daily nutritional targets</p>
        </div>
      </div>

      <Card className="bg-white border-2 border-gray-200 glow-blue">
        <CardHeader>
          <CardTitle className="font-black italic text-[#1a1a1a]">DAILY TARGETS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Calories (kcal)</Label>
            <Input
              type="number"
              value={goals.daily_calorie_target}
              onChange={(e) => setGoals({ ...goals, daily_calorie_target: parseFloat(e.target.value) || 0 })}
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Protein (grams)</Label>
            <Input
              type="number"
              value={goals.daily_protein_target}
              onChange={(e) => setGoals({ ...goals, daily_protein_target: parseFloat(e.target.value) || 0 })}
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Carbs (grams)</Label>
            <Input
              type="number"
              value={goals.daily_carbs_target}
              onChange={(e) => setGoals({ ...goals, daily_carbs_target: parseFloat(e.target.value) || 0 })}
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Fats (grams)</Label>
            <Input
              type="number"
              value={goals.daily_fats_target}
              onChange={(e) => setGoals({ ...goals, daily_fats_target: parseFloat(e.target.value) || 0 })}
              className="text-lg font-bold"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={updateGoalsMutation.isPending}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic text-lg py-6"
          >
            {updateGoalsMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                SAVE GOALS
              </>
            )}
          </Button>

          {updateGoalsMutation.isSuccess && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm text-green-700 font-bold">✓ Goals saved successfully!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] mb-2">💡 TIPS</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Set realistic goals based on your fitness objectives</li>
            <li>• Consult your trainer for personalized recommendations</li>
            <li>• Adjust goals as you progress on your journey</li>
            <li>• Track your progress daily in the Nutrition tab</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}