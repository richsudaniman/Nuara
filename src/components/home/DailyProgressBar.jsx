import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap } from "lucide-react";

export default function DailyProgressBar({ completedTasks, totalTasks }) {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <Card className="bg-white border-0 shadow-sm rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[#1a1a1a] font-bold text-base mb-1">Today's Progress</h3>
            <p className="text-gray-400 text-sm">{completedTasks}/{totalTasks} tasks completed</p>
          </div>
          {percentage === 100 && (
            <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-1 -translate-y-1/2 pointer-events-none">
              <div className={`w-2 h-2 rounded-full ${percentage >= 25 ? 'bg-white' : 'bg-gray-200'}`}></div>
              <div className={`w-2 h-2 rounded-full ${percentage >= 50 ? 'bg-white' : 'bg-gray-200'}`}></div>
              <div className={`w-2 h-2 rounded-full ${percentage >= 75 ? 'bg-white' : 'bg-gray-200'}`}></div>
              <div className={`w-2 h-2 rounded-full ${percentage >= 100 ? 'bg-white' : 'bg-gray-200'}`}></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#0ea5e9] text-lg font-bold">{percentage}%</span>
            {percentage === 100 && (
              <span className="text-sm font-semibold text-green-600">Perfect Day! 🎉</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}