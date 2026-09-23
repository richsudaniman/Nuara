import React from "react";

export default function DayProgress({ done, total }) {
  if (!total) return null;
  const msg = done === total ? "Amazing! All done! 🎉" : done === 0 ? "Let's get started! 🚀" : "Keep going, you got this! 💪";
  return (
    <div className="p-3.5 bg-white border border-[#F3F4F6] rounded-2xl">
      <div className="flex items-center justify-between mb-2 font-body">
        <span className="text-[14px] font-semibold text-[#18181B]">{msg}</span>
        <span className="text-[14px] font-bold text-[#8B5CF6]">{done}/{total}</span>
      </div>
      <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
        <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </div>
    </div>
  );
}