import React from "react";
import { ArrowLeftRight } from "lucide-react";
import ClinicalChips from "@/components/exercises/ClinicalChips";
import { splitPair } from "@/lib/homeworkDelivery";

export default function MinimalPairCard({ exercise, done }) {
  const [a, b] = splitPair(exercise.name);
  return (
    <>
      <p className={`font-display text-[18px] font-bold leading-tight flex items-center gap-2 flex-wrap ${done ? "text-[#8B5CF6]" : "text-[#18181B]"}`}>
        <span>{a}</span>
        <ArrowLeftRight className="w-4 h-4 text-[#A1A1AA]" />
        <span>{b}</span>
      </p>
      <ClinicalChips exercise={exercise} className="mt-1.5" />
    </>
  );
}