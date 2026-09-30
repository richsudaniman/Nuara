import React from "react";

export default function DaySelector({ days, counts, selected, today, onSelect }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const active = day === selected;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`relative min-h-[52px] rounded-xl font-body flex flex-col items-center justify-center gap-0.5 border transition-colors ${
              active ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-white border-[#F3F4F6] text-[#18181B] hover:border-[#DDD6FE]"
            }`}
          >
            <span className="text-[12px] font-semibold">{day.slice(0, 3)}</span>
            <span className={`text-[10px] font-semibold px-1.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-[#F5F3FF] text-[#6D28D9]"}`}>
              {counts[day]}
            </span>
            {day === today && !active && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />}
          </button>
        );
      })}
    </div>
  );
}