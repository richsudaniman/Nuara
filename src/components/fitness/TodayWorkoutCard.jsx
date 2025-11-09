import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Clock, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TodayWorkoutCard({ workout }) {
  if (!workout) {
    return (
      <Card className="bg-black border-2 border-white/20">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 italic">Rest day - No workout scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-24 h-24 border-2 border-[#d4af37]/20 rotate-12"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="w-6 h-6 text-[#d4af37]" />
          <h3 className="font-black text-xl italic text-white">TODAY'S WORKOUT</h3>
        </div>
        
        <div className="bg-[#1a1a1a] border-l-4 border-[#d4af37] p-5 mb-5 relative">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
            <div className="w-full h-full border-2 border-[#d4af37]" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}></div>
          </div>
          <h4 className="text-2xl font-black italic text-white mb-3">{workout.workout_type}</h4>
          <div className="flex gap-5 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Flame className="w-5 h-5 text-[#d4af37]" />
              <span className="font-semibold">{workout.exercises?.length || 0} exercises</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5 text-[#d4af37]" />
              <span className="font-semibold">45-60 min</span>
            </div>
          </div>
        </div>

        <Link to={createPageUrl("Workout")}>
          <button className="w-full bg-[#d4af37] hover:bg-[#c19b2b] text-black font-black italic py-4 transition-all duration-200 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] text-lg relative overflow-hidden group">
            <span className="relative z-10">START WORKOUT</span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}