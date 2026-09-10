import React from "react";
import { Button } from "@/components/ui/button";
import ContrastSoundsStep from "@/components/homework/ContrastSoundsStep";
import PositionStep from "@/components/homework/PositionStep";
import RefineFilters from "@/components/homework/RefineFilters";
import { contrastError } from "@/lib/minimalPairsBank";

export default function MinimalPairsPanel({
  sound1, sound2, onSoundChange, pattern, onPatternChange,
  positions, onTogglePosition, excluded, onToggleExcluded,
  filters, onFiltersChange, onClear, onCreate,
}) {
  const error = contrastError(sound1, sound2);
  const ready = !!sound1 && !!sound2 && !error;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 pb-7 divide-y divide-gray-100">
      <ContrastSoundsStep
        sound1={sound1}
        sound2={sound2}
        onSoundChange={onSoundChange}
        pattern={pattern}
        onPatternChange={onPatternChange}
        error={error}
      />

      <PositionStep
        positions={positions}
        onToggle={onTogglePosition}
        excluded={excluded}
        onToggleExcluded={onToggleExcluded}
        disabled={!ready}
      />

      <div className={!ready ? "opacity-40 pointer-events-none" : ""}>
        <div className="flex items-center gap-4 py-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500 text-white">STEP 3</span>
          <span className="text-lg font-bold text-gray-900">Refine Your Filters</span>
        </div>
        <RefineFilters filters={filters} onChange={onFiltersChange} />
      </div>

      <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={onClear} className="h-12 px-6 rounded-xl border-gray-200 text-gray-500 font-semibold">
          Clear Filters
        </Button>
        <Button onClick={onCreate} disabled={!ready} className="h-12 px-6 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-base font-bold disabled:opacity-60">
          Create Word Cards →
        </Button>
      </div>
    </div>
  );
}