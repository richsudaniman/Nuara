import React from "react";
import { Star, Flame, Mic, Trophy, Heart, Rocket } from "lucide-react";

export default function AchievementBadges({ practiceDays, totalSubmissions, goalsCount }) {
  const badges = [
    { icon: Rocket, label: "First practice", earned: totalSubmissions >= 1 },
    { icon: Mic, label: "10 recordings", earned: totalSubmissions >= 10 },
    { icon: Flame, label: "3-day streak", earned: practiceDays >= 3 },
    { icon: Star, label: "Perfect week", earned: practiceDays >= 5 },
    { icon: Trophy, label: "Goal setter", earned: goalsCount >= 2 },
    { icon: Heart, label: "50 practices", earned: totalSubmissions >= 50 },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-semibold text-[#0F0F12]">My badges</h2>
        <span className="text-[12px] font-semibold text-[#A78BFA]">{earnedCount}/{badges.length} earned</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map(({ icon: Icon, label, earned }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                earned ? "bg-[#EDE7FE]" : "bg-[#F5F5F7]"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${earned ? "text-[#A78BFA]" : "text-[#D1D1D6]"}`}
                strokeWidth={2.25}
              />
            </div>
            <p className={`text-[11px] font-medium leading-tight ${earned ? "text-[#0F0F12]" : "text-[#B4B4BB]"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}