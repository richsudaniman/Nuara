import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Award } from "lucide-react";

export default function QuickStatsCard({ workoutLogs }) {
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = workoutLogs?.filter(log => {
    const logDate = new Date(log.completed_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }) || [];

  const todayCompleted = workoutLogs?.filter(log => log.completed_date === today) || [];
  
  const stats = [
    { icon: Calendar, label: "This Week", value: `${thisWeek.length}`, color: "text-[#d4af37]" },
    { icon: TrendingUp, label: "Streak", value: "5", color: "text-white" },
    { icon: Award, label: "Today", value: `${todayCompleted.length}`, color: "text-[#d4af37]" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[#1a1a1a] border border-[#d4af37]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 border border-[#d4af37]/10 rotate-45 transform translate-x-6 -translate-y-6"></div>
          <CardContent className="p-4 relative z-10">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="text-3xl font-black italic text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}