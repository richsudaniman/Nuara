import React from "react";
import { Button } from "@/components/ui/button";
import WordCard from "@/components/homework/WordCard";
import { POSITIONS } from "@/lib/wordBank";

export default function WordCardGrid({ cards, selectedIds, onToggle, onSelectAll, onClearSelection, reps, onRepsChange }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
        <p className="font-medium text-gray-700">No words match these filters</p>
        <p className="text-sm text-gray-400 mt-1">Try a different word length or position</p>
      </div>
    );
  }

  const groups = [];
  cards.forEach((c) => {
    const key = `${c.phonemeId}-${c.position}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, phonemeLabel: c.phonemeLabel, phonemeIpa: c.phonemeIpa, position: c.position, cards: [] };
      groups.push(g);
    }
    g.cards.push(c);
  });

  const allSelected = selectedIds.length === cards.length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{selectedIds.length}</span> of {cards.length} cards selected · grouped by target sound
        </p>
        <Button onClick={allSelected ? onClearSelection : onSelectAll} className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6">
          {allSelected ? "Deselect All" : `Select All (${cards.length})`}
        </Button>
      </div>

      {groups.map((g) => {
        const pos = POSITIONS.find((p) => p.id === g.position);
        return (
          <div key={g.key} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-bold">/{g.phonemeIpa}/</span>
              <span className={`px-2.5 py-0.5 rounded-full border-2 text-xs font-semibold ${pos.chip}`}>{pos.label}</span>
              <span className="text-xs text-gray-400">{g.cards.length} words</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {g.cards.map((c) => (
                <WordCard
                  key={c.id}
                  card={c}
                  selected={selectedIds.includes(c.id)}
                  onToggle={onToggle}
                  reps={reps[c.id] ?? 5}
                  onRepsChange={onRepsChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}