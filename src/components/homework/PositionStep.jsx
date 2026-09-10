import React, { useState } from "react";
import { Check, ChevronRight, ChevronDown } from "lucide-react";
import { POSITIONS, ALL_PHONEMES } from "@/lib/wordBank";

export default function PositionStep({ positions, onToggle, excluded, onToggleExcluded, disabled }) {
  const [showExclude, setShowExclude] = useState(false);

  return (
    <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <div className="flex items-center gap-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${positions.length ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"}`}>
          STEP 2
        </span>
        <span className="text-lg font-bold text-gray-900">Select Word Position(s)</span>
      </div>

      <div className="pb-5 space-y-4">
        <div className="flex justify-center gap-3">
          {POSITIONS.map((p) => {
            const active = positions.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className={`w-40 h-12 rounded-xl border-2 text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors ${
                  active ? "border-sky-500 bg-sky-50 text-sky-800" : "border-gray-200 bg-white text-gray-800 hover:border-sky-300"
                }`}
              >
                {active && <Check className="w-4 h-4" strokeWidth={3} />}
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 pt-3">
          <button onClick={() => setShowExclude(!showExclude)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            {showExclude ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Exclude sounds?
            {excluded.length > 0 && <span className="text-xs font-semibold text-purple-600">({excluded.length})</span>}
          </button>
          {showExclude && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ALL_PHONEMES.map((ph) => (
                <button
                  key={ph.id}
                  onClick={() => onToggleExcluded(ph.id)}
                  className={`px-3 h-8 rounded-lg border text-xs font-semibold transition-colors ${
                    excluded.includes(ph.id) ? "border-red-400 bg-red-50 text-red-600 line-through" : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
                  }`}
                >
                  /{ph.ipa}/
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}