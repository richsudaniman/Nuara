import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { POSITIONS } from "@/lib/wordBank";

function PhonemeLabel({ label }) {
  // Vowel labels like "sEE" — lowercase is context, uppercase is the target
  if (label === label.toUpperCase() || label.includes(" ")) return <span>{label}</span>;
  return (
    <span>
      {label.split("").map((ch, i) => (
        <span key={i} className={ch === ch.toUpperCase() ? "text-gray-900" : "text-gray-400"}>{ch}</span>
      ))}
    </span>
  );
}

export default function PhonemeChip({ phoneme, selectedPositions, onToggle, maxReached }) {
  const active = selectedPositions.length > 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`h-12 min-w-[104px] px-4 rounded-full border-2 text-sm font-bold transition-all ${
            active ? "bg-purple-100 border-purple-400 text-purple-900" : "bg-white border-purple-200 text-gray-800 hover:border-purple-400"
          }`}
        >
          <PhonemeLabel label={phoneme.label} />
          {active && (
            <span className="ml-1.5 inline-flex gap-0.5 align-middle">
              {selectedPositions.map((p) => (
                <span key={p} className={`w-1.5 h-1.5 rounded-full ${POSITIONS.find((x) => x.id === p).dot}`} />
              ))}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-40 p-2 rounded-2xl space-y-1.5 shadow-lg">
        {POSITIONS.map((pos) => {
          const on = selectedPositions.includes(pos.id);
          return (
            <button
              key={pos.id}
              disabled={!on && maxReached}
              onClick={() => onToggle(phoneme.id, pos.id)}
              className={`w-full h-9 rounded-full border-2 text-sm font-semibold transition-colors disabled:opacity-40 ${on ? pos.fill : pos.chip}`}
            >
              {pos.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}