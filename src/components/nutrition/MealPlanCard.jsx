import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Flame } from "lucide-react";

export default function MealPlanCard({ meals }) {
  return (
    <Card className="bg-white border-2 border-[#0ea5e9]/30 glow-blue">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-black italic text-[#1a1a1a] text-xl">MEAL PLAN</h3>
        </div>

        <div className="space-y-3">
          {meals?.sort((a, b) => a.order - b.order).map((meal) => (
            <div
              key={meal.id}
              className="bg-gray-50 border-l-4 border-[#0ea5e9] p-4 relative overflow-hidden hover:bg-gray-100 transition-colors"
            >
              <div className="absolute top-0 right-0 w-12 h-12 border border-[#0ea5e9]/10" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-black italic text-[#1a1a1a] text-lg">{meal.meal_name}</h4>
                  {meal.meal_time && (
                    <p className="text-xs text-gray-500 mt-0.5 font-semibold">{meal.meal_time}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-[#0ea5e9] px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-white" />
                  <span className="text-sm font-black text-white italic">{meal.calories}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{meal.description}</p>

              <div className="flex gap-5 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold uppercase">Protein</span>
                  <span className="font-black text-[#1a1a1a] italic text-lg">{meal.protein}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold uppercase">Carbs</span>
                  <span className="font-black text-[#1a1a1a] italic text-lg">{meal.carbs}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold uppercase">Fats</span>
                  <span className="font-black text-[#1a1a1a] italic text-lg">{meal.fats}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}