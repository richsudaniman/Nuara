import React from "react";
import { Minus, Plus } from "lucide-react";

export default function RepsStepper({ value, onChange, size = "sm" }) {
  const stop = (e) => e.stopPropagation();
  const set = (n) => onChange(Math.max(1, Math.min(50, n)));
  const btn = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  return (
    <div onClick={stop} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1 py-0.5">
      <button type="button" onClick={() => set(value - 1)} className={`${btn} rounded-full flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-700`}>
        <Minus className="w-3 h-3" strokeWidth={2.5} />
      </button>
      <span className="text-xs font-bold text-gray-800 min-w-[34px] text-center">{value}×</span>
      <button type="button" onClick={() => set(value + 1)} className={`${btn} rounded-full flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-700`}>
        <Plus className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}