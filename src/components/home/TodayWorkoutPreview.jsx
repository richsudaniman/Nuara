import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Clock, Flame, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TodayWorkoutPreview({ workout }) {
  if (!workout) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-5">
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 italic">Rest day - No workout scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-all duration-200 glow-blue">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-black text-lg italic text-[#1a1a1a]">TODAY'S WORKOUT</h3>
        </div>
        
        <div className="bg-gray-50 border-l-4 border-[#0ea5e9] p-4 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#0ea5e9]/10 rounded-full blur-2xl"></div>
          <h4 className="text-2xl font-black italic text-[#1a1a1a] mb-3 relative z-10">{workout.workout_type}</h4>
          <div className="flex gap-5 text-sm relative z-10">
            <div className="flex items-center gap-2 text-gray-700">
              <Flame className="w-5 h-5 text-[#0ea5e9]" />
              <span className="font-semibold">{workout.exercises?.length || 0} exercises</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-[#0ea5e9]" />
              <span className="font-semibold">45-60 min</span>
            </div>
          </div>
        </div>

        <Link to={createPageUrl("Workout")}>
          <button className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic py-4 transition-all duration-200 glow-blue-intense text-lg relative overflow-hidden group flex items-center justify-center gap-2">
            <span className="relative z-10">START WORKOUT</span>
            <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}