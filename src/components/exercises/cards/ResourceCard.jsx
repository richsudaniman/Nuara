import React from "react";
import { PlayCircle } from "lucide-react";
import ClinicalChips from "@/components/exercises/ClinicalChips";

export default function ResourceCard({ exercise, done }) {
  return (
    <>
      <p className={`font-display text-[17px] font-bold leading-tight ${done ? "text-[#8B5CF6]" : "text-[#18181B]"}`}>{exercise.name}</p>
      {exercise.notes && <p className="font-body text-[13px] text-[#71717A] mt-1 line-clamp-2">{exercise.notes}</p>}
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        {exercise.video_url && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-[12px] font-body font-medium">
            <PlayCircle className="w-3 h-3" /> Demo video
          </span>
        )}
        <ClinicalChips exercise={exercise} />
      </div>
    </>
  );
}