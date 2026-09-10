import React from "react";
import { Flame, Trophy, Sparkles } from "lucide-react";

export default function ProgressHero({ practiceDays, totalSubmissions, activeGoals, avgAccuracy }) {
  const weeklyGoal = 5;
  const pct = Math.min(100, Math.round((practiceDays / weeklyGoal) * 100));

  return (
    <div className="bg-gradient-to-br from-[#A78BFA] to-[#7C6BF5] rounded-3xl p-5 text-white space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-white/70">You're doing great</p>
          <p className="text-[26px] font-bold leading-tight mt-1">
            {practiceDays} of {weeklyGoal} days this week! {pct >= 100 ? "🎉" : "💪"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/15 rounded-2xl flex-shrink-0">
          <Flame className="w-4 h-4 text-[#FDBA74]" />
          <span className="text-[13px] font-bold">{practiceDays} day streak</span>
        </div>
      </div>

      <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: Trophy, value: activeGoals, label: "Goals" },
          { icon: Sparkles, value: totalSubmissions, label: "Practices" },
          { icon: Flame, value: avgAccuracy ? `${avgAccuracy}%` : "—", label: "Avg score" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-white/15 rounded-2xl p-3">
            <Icon className="w-4 h-4 text-white/80 mb-1.5" strokeWidth={2.25} />
            <p className="text-[20px] font-bold leading-none">{value}</p>
            <p className="text-[11px] text-white/70 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}