import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Flame } from "lucide-react";

export default function MealPlanCard({ meals }) {
  return (
    <Card className="bg-white border-0 shadow-sm rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] rounded-2xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">Meal Plan</h3>
        </div>

        <div className="space-y-3">
          {meals?.sort((a, b) => a.order - b.order).map((meal) => (
            <div
              key={meal.id}
              className="bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-[#1a1a1a] text-base">{meal.meal_name}</h4>
                  {meal.meal_time && (
                    <p className="text-xs text-gray-400 mt-1">{meal.meal_time}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-[#0ea5e9] px-3 py-1.5 rounded-xl">
                  <Flame className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">{meal.calories}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{meal.description}</p>

              <div className="flex gap-6 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium mb-1">Protein</span>
                  <span className="font-bold text-[#1a1a1a] text-base">{meal.protein}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium mb-1">Carbs</span>
                  <span className="font-bold text-[#1a1a1a] text-base">{meal.carbs}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium mb-1">Fats</span>
                  <span className="font-bold text-[#1a1a1a] text-base">{meal.fats}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}