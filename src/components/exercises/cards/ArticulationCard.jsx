import React from "react";
import ClinicalChips from "@/components/exercises/ClinicalChips";

export default function ArticulationCard({ exercise, done }) {
  return (
    <>
      <p className={`font-display text-[18px] font-bold leading-tight ${done ? "text-[#8B5CF6]" : "text-[#18181B]"}`}>{exercise.name}</p>
      <ClinicalChips exercise={exercise} className="mt-1.5" />
    </>
  );
}