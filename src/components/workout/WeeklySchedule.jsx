
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export default function WeeklySchedule({ workoutPlans, selectedDay, onDaySelect, completedDays }) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const daysShort = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  
  return (
    <Card className="bg-white border-2 border-[#0ea5e9]/30 glow-blue">
      <CardContent className="p-5">
        <h3 className="font-black italic text-[#1a1a1a] mb-4 text-lg">WEEKLY SCHEDULE</h3>
        <div className="flex justify-between gap-2">
          {daysOfWeek.map((day, index) => {
            const plan = workoutPlans.find(p => p.day_of_week === day);
            const isSelected = selectedDay === day;
            const isCompleted = completedDays.includes(day);
            
            return (
              <button
                key={day}
                onClick={() => onDaySelect(day)}
                className={`flex-1 py-3 px-2 transition-all duration-200 border-2 relative overflow-hidden ${
                  isSelected
                    ? "bg-[#0ea5e9] border-[#0ea5e9] text-white glow-blue-intense scale-105"
                    : plan
                    ? "bg-white border-gray-300 text-gray-600 hover:border-[#0ea5e9]/50"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                <div className="text-xs font-black mb-1 italic">{daysShort[index]}</div>
                <div className="flex justify-center">
                  {plan ? (
                    isCompleted ? (
                      <CheckCircle2 className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#0ea5e9]"}`} />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )
                  ) : (
                    <span className="text-xs">REST</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
