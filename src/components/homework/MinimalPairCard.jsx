import React from "react";
import { Check } from "lucide-react";
import { POSITIONS } from "@/lib/wordBank";
import RepsStepper from "@/components/homework/RepsStepper";

function Side({ word, ipa, other, accent }) {
  const [before, target, after] = ipa.split(/[{}]/);
  const badge = accent === "gold" ? "bg-amber-500" : "bg-purple-500";
  const hl = accent === "gold" ? "text-amber-600" : "text-purple-600";
  return (
    <div className="relative flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 pt-7 pb-4 text-center">
      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${badge}`}>vs {other}</span>
      <p className="text-lg font-bold text-gray-900">{word}</p>
      <p className="text-sm text-gray-500 font-serif mt-1">
        /{before}<span className={`font-bold ${hl}`}>{target}</span>{after}/
      </p>
    </div>
  );
}

export default function MinimalPairCard({ pair, selected, onToggle, reps, onRepsChange }) {
  const pos = POSITIONS.find((p) => p.id === pair.position);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(pair.id)}
      onKeyDown={(e) => e.key === "Enter" && onToggle(pair.id)}
      className={`relative cursor-pointer rounded-3xl border-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-purple-400 bg-purple-50/40 shadow-md" : "border-gray-100 bg-white shadow-sm opacity-75"
      }`}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      )}
      <div className="flex items-center gap-3">
        <Side word={pair.word1} ipa={pair.ipa1} other={pair.word2} accent="gold" />
        <span className="text-xs font-bold text-gray-300 tracking-widest">vs</span>
        <Side word={pair.word2} ipa={pair.ipa2} other={pair.word1} accent="purple" />
      </div>
      <div className="flex items-center justify-center gap-3 mt-3">
        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${pos.chip}`}>{pos.label}</span>
        <RepsStepper value={reps} onChange={(n) => onRepsChange(pair.id, n)} />
      </div>
    </div>
  );
}