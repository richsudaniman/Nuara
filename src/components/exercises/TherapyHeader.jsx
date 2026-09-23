import React from "react";
import { Star } from "lucide-react";

export default function TherapyHeader({ firstName, points, isDemo }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[24px] font-bold text-[#18181B] leading-tight">
            Hi{firstName ? `, ${firstName}` : ""}! 🎯
          </h1>
          <p className="font-body text-[14px] text-[#71717A]">Tap an activity to start practicing</p>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#F3F4F6] shadow-sm font-body text-[14px] font-bold text-[#18181B]">
          <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" /> {points}
        </span>
      </div>
      {isDemo && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#F59E0B] text-white font-body text-[12px] font-bold">Sample practice</span>
          <p className="font-body text-[13px] text-[#78350F] leading-snug">
            This is example homework. Your real activities will appear here once your therapist assigns them.
          </p>
        </div>
      )}
    </div>
  );
}