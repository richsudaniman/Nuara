import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap } from "lucide-react";

export default function DailyProgressBar({ completedTasks, totalTasks }) {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <Card className="bg-white border-2 border-[#0ea5e9]/30 relative overflow-hidden glow-blue">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#0ea5e9]/5 rounded-full blur-3xl"></div>
      <CardContent className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0ea5e9]" />
            <h3 className="font-black italic text-[#1a1a1a]">TODAY'S PROGRESS</h3>
          </div>
          <div className="flex items-center gap-1 bg-[#0ea5e9] px-3 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-sm font-black text-white italic">{percentage}%</span>
          </div>
        </div>
        
        <Progress value={percentage} className="h-3 bg-gray-100" />
        
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm text-gray-600">
            <span className="text-[#0ea5e9] font-bold">{completedTasks}</span> of {totalTasks} tasks completed
          </p>
          {percentage === 100 && (
            <span className="text-xs text-[#0ea5e9] font-bold italic animate-pulse">🔥 PERFECT DAY!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}