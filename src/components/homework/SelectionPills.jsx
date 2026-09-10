import React from "react";
import { X } from "lucide-react";
import { ALL_PHONEMES, POSITIONS, selectionKey } from "@/lib/wordBank";

export default function SelectionPills({ selections, onRemove, compact = false }) {
  if (selections.length === 0) {
    return <span className="text-sm italic text-gray-500">No phonemes selected</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {selections.map((s) => {
        const ph = ALL_PHONEMES.find((p) => p.id === s.phonemeId);
        const pos = POSITIONS.find((p) => p.id === s.position);
        return (
          <span
            key={selectionKey(s)}
            className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-lg border-2 text-sm font-semibold ${pos.chip}`}
          >
            /{ph?.ipa}/ <span className="text-xs font-bold opacity-70">{pos.short}</span>
            {onRemove && (
              <button
                onClick={() => onRemove(s)}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${pos.dot}`}
              >
                <X className="w-2.5 h-2.5" strokeWidth={3} />
              </button>
            )}
            {compact && null}
          </span>
        );
      })}
    </div>
  );
}