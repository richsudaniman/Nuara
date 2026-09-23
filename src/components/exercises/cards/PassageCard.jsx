import React from "react";
import ClinicalChips from "@/components/exercises/ClinicalChips";

export default function PassageCard({ exercise, done }) {
  return (
    <>
      <p className={`font-body text-[15px] font-semibold leading-snug ${done ? "text-[#8B5CF6]" : "text-[#18181B]"}`}>
        “{exercise.name}”
      </p>
      <ClinicalChips exercise={exercise} className="mt-1.5" />
    </>
  );
}