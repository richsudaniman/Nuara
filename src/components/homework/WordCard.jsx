import React from "react";
import { Check } from "lucide-react";
import { POSITIONS } from "@/lib/wordBank";
import RepsStepper from "@/components/homework/RepsStepper";

export default function WordCard({ card, selected, onToggle, reps, onRepsChange }) {
  const [before, target, after] = card.ipa.split(/[{}]/);
  const pos = POSITIONS.find((p) => p.id === card.position);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(card.id)}
      onKeyDown={(e) => e.key === "Enter" && onToggle(card.id)}
      className={`relative cursor-pointer bg-white rounded-2xl border-2 p-5 flex flex-col items-center gap-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-purple-400 shadow-md" : "border-gray-100 shadow-sm opacity-70"
      }`}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      )}
      <span className="text-5xl leading-none my-3">{card.icon}</span>
      <p className="text-lg font-bold text-gray-800">{card.word}</p>
      <p className="text-sm text-gray-500 font-serif">
        /{before}<span className="font-bold text-green-600 mx-px">{target}</span>{after}/
      </p>
      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${pos.chip}`}>
        /{card.phonemeIpa}/ {pos.short}
      </span>
      <div className="mt-1">
        <RepsStepper value={reps} onChange={(n) => onRepsChange(card.id, n)} />
      </div>
    </div>
  );
}