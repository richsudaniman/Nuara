import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Dumbbell, Award, Beef } from "lucide-react";

export default function QuickStatsGrid({ stats }) {
  const { protein = 0, proteinGoal = 150, calories = 0, calorieGoal = 2200, workoutsThisWeek = 0, currentStreak = 0 } = stats;

  const statCards = [
    { 
      icon: Beef, 
      label: "Protein", 
      value: Math.round(protein), 
      goal: proteinGoal,
      progress: Math.min((protein / proteinGoal) * 100, 100),
      suffix: "g",
      color: "text-[#10b981]",
      bgColor: "bg-[#10b981]/10"
    },
    { 
      icon: Flame, 
      label: "Calories", 
      value: calories, 
      goal: calorieGoal,
      progress: Math.min((calories / calorieGoal) * 100, 100),
      color: "text-[#f97316]",
      bgColor: "bg-[#f97316]/10"
    },
    { 
      icon: Dumbbell, 
      label: "Workouts", 
      value: workoutsThisWeek, 
      suffix: " this week",
      color: "text-[#0ea5e9]",
      bgColor: "bg-[#0ea5e9]/10"
    },
    { 
      icon: Award, 
      label: "Streak", 
      value: currentStreak, 
      suffix: " days",
      color: "text-[#eab308]",
      bgColor: "bg-[#eab308]/10"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-3xl">
          <CardContent className="p-6">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-3 shadow-sm`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-gray-500 ml-1">{stat.suffix}</span>}
            </p>
            {stat.goal && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Goal: {stat.goal}</span>
                  <span className={`${stat.color} font-semibold`}>{Math.round(stat.progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.bgColor.replace('/10', '')} transition-all duration-300 rounded-full`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}