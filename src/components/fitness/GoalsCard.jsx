import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function GoalsCard({ goals }) {
  if (!goals || goals.length === 0) return null;

  return (
    <Card className="bg-black border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 border border-[#d4af37]/20 rotate-45 transform translate-x-16 -translate-y-16"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#d4af37] flex items-center justify-center" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Target className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-white font-black text-xl italic">YOUR GOALS</h3>
        </div>
        <div className="space-y-4">
          {goals.slice(0, 2).map((goal) => (
            <div key={goal.id} className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-none p-4 relative">
              <div className="absolute top-2 right-2 w-8 h-8 border border-[#d4af37]/50" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-bold italic text-lg">{goal.goal_title}</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    <span className="text-[#d4af37] font-semibold">{goal.current_value}</span> → <span className="text-white font-semibold">{goal.target_value}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#d4af37] px-3 py-1">
                  <TrendingUp className="w-3 h-3 text-black" />
                  <span className="text-xs font-black text-black italic">{goal.progress_percentage}%</span>
                </div>
              </div>
              <Progress value={goal.progress_percentage} className="h-1.5 bg-[#2a2a2a]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}