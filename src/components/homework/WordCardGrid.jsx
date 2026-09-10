import React from "react";
import { Button } from "@/components/ui/button";
import WordCard from "@/components/homework/WordCard";

export default function WordCardGrid({ cards, selectedIds, onToggle, onSelectAll, onClearSelection }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
        <p className="font-medium text-gray-700">No words match these filters</p>
        <p className="text-sm text-gray-400 mt-1">Try a different word length or position</p>
      </div>
    );
  }
  const allSelected = selectedIds.length === cards.length;
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <Button
          onClick={allSelected ? onClearSelection : onSelectAll}
          className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6"
        >
          {allSelected ? "Deselect All" : `Select All (${cards.length})`}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <WordCard key={c.id} card={c} selected={selectedIds.includes(c.id)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}