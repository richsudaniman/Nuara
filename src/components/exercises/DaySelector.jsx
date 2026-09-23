import React, { useEffect, useRef } from "react";

export default function DaySelector({ days, counts, selected, today, onSelect }) {
  const activeRef = useRef(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {days.map((day) => {
        const active = day === selected;
        return (
          <button
            key={day}
            ref={active ? activeRef : null}
            onClick={() => onSelect(day)}
            className={`relative flex-shrink-0 min-h-[44px] px-4 rounded-full font-body text-[14px] font-semibold flex items-center gap-2 border transition-colors ${
              active ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-white border-[#F3F4F6] text-[#18181B] hover:border-[#DDD6FE]"
            }`}
          >
            {day.slice(0, 3)}
            <span className={`text-[12px] px-1.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-[#F5F3FF] text-[#6D28D9]"}`}>
              {counts[day]}
            </span>
            {day === today && !active && <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />}
          </button>
        );
      })}
    </div>
  );
}