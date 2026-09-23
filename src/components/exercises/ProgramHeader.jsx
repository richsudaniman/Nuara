import React from "react";
import { Target } from "lucide-react";
import { metaFor } from "@/lib/homeworkDelivery";

export default function ProgramHeader({ plan }) {
  return (
    <div className="bg-white border border-[#F3F4F6] rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${plan.tint} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>{plan.emoji}</div>
        <div className="min-w-0">
          <p className="font-body text-[12px] font-semibold text-[#71717A] uppercase tracking-wider">
            {plan.day} · {metaFor(plan.homeworkType).label}
          </p>
          <h2 className="font-display text-[18px] font-bold text-[#18181B] leading-tight">{plan.title}</h2>
        </div>
      </div>
      {plan.strategyTarget && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F3FF] text-[#6D28D9] font-body text-[13px] font-medium">
          <Target className="w-4 h-4 flex-shrink-0" /> Focus: {plan.strategyTarget}
        </div>
      )}
    </div>
  );
}