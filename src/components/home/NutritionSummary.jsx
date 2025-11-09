import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Target, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";

export default function NutritionSummary({ caloriesConsumed = 0, calorieGoal = 2200, macros = {} }) {
  const percentage = Math.min((caloriesConsumed / calorieGoal) * 100, 100);
  const remaining = calorieGoal - caloriesConsumed;
  
  const { protein = 0, carbs = 0, fats = 0 } = macros;

  return (
    <Card className="bg-white border border-gray-200 hover:border-[#0ea5e9] hover:shadow-lg transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0ea5e9]/20 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <h3 className="font-black italic text-[#1a1a1a]">NUTRITION</h3>
          </div>
          <Link to={createPageUrl("Nutrition")}>
            <ChevronRight className="w-5 h-5 text-gray-500 hover:text-[#0ea5e9] transition-colors" />
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 font-bold uppercase tracking-wider">Daily Calories</span>
            <span className="text-sm font-black italic text-[#1a1a1a]">
              <span className="text-[#0ea5e9]">{caloriesConsumed}</span> / {calorieGoal}
            </span>
          </div>
          <Progress value={percentage} className="h-2 bg-gray-200 mb-2" />
          <div className="flex items-center gap-2 text-xs">
            {remaining > 0 ? (
              <>
                <Target className="w-3 h-3 text-[#0ea5e9]" />
                <span className="text-gray-600">{remaining} calories remaining</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-[#f97316]" />
                <span className="text-gray-600">{Math.abs(remaining)} calories over</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Protein</p>
            <p className="text-xl font-black italic text-[#0ea5e9]">{protein}g</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Carbs</p>
            <p className="text-xl font-black italic text-[#1a1a1a]">{carbs}g</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fats</p>
            <p className="text-xl font-black italic text-[#1a1a1a]">{fats}g</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}