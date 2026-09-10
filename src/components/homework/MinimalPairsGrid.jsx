import React from "react";
import { Button } from "@/components/ui/button";
import MinimalPairCard from "@/components/homework/MinimalPairCard";
import { soundIpa } from "@/lib/minimalPairsBank";

export default function MinimalPairsGrid({ pairs, sound1, sound2, selectedIds, onToggle, onSelectAll, onClearSelection, reps, onRepsChange }) {
  if (pairs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
        <p className="font-medium text-gray-700">No minimal pairs match these filters</p>
        <p className="text-sm text-gray-400 mt-1">Try other positions, syllable counts, or a different contrast</p>
      </div>
    );
  }

  const allSelected = selectedIds.length === pairs.length;
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <Button onClick={allSelected ? onClearSelection : onSelectAll} className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-7 h-11">
          {allSelected ? "Deselect All" : `Select All (${pairs.length})`}
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 text-center py-3 rounded-xl border-2 border-amber-500 bg-amber-50/50 text-sm font-bold text-amber-800">
          Sound 1: /{soundIpa(sound1)}/
        </div>
        <div className="flex-1 text-center py-3 rounded-xl border-2 border-purple-600 bg-purple-50/50 text-sm font-bold text-purple-800">
          Sound 2: /{soundIpa(sound2)}/
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pairs.map((p) => (
          <MinimalPairCard
            key={p.id}
            pair={p}
            selected={selectedIds.includes(p.id)}
            onToggle={onToggle}
            reps={reps[p.id] ?? 5}
            onRepsChange={onRepsChange}
          />
        ))}
      </div>
    </div>
  );
}