import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PHONEME_TABS, MAX_SELECTIONS, selectionKey } from "@/lib/wordBank";
import PhonemeChip from "@/components/homework/PhonemeChip";
import SelectionPills from "@/components/homework/SelectionPills";

export default function PhonemeSelectorDialog({ open, onOpenChange, selections, onChange }) {
  const [tab, setTab] = useState("consonants");
  const maxReached = selections.length >= MAX_SELECTIONS;

  const toggle = (phonemeId, position) => {
    const key = `${phonemeId}-${position}`;
    const exists = selections.some((s) => selectionKey(s) === key);
    if (exists) onChange(selections.filter((s) => selectionKey(s) !== key));
    else if (!maxReached) onChange([...selections, { phonemeId, position }]);
  };

  const remove = (sel) => onChange(selections.filter((s) => selectionKey(s) !== selectionKey(sel)));
  const activeTab = PHONEME_TABS.find((t) => t.id === tab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-purple-100 bg-white pr-14">
          <span className="text-sm font-bold text-gray-800 flex-shrink-0">{selections.length}/{MAX_SELECTIONS} selected:</span>
          <SelectionPills selections={selections} onRemove={remove} />
        </div>

        <div className="px-5 py-3 bg-purple-50/60 flex gap-2 border-b border-purple-100">
          {PHONEME_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 h-11 rounded-xl text-sm font-bold transition-colors ${
                tab === t.id ? "bg-purple-500 text-white" : "bg-white text-purple-600 hover:bg-purple-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
          {activeTab.rows.map((row) => (
            <div key={row.label} className="flex gap-6 px-6 py-5">
              <span className="w-28 flex-shrink-0 text-sm text-gray-500 pt-3">{row.label}</span>
              <div className="flex flex-wrap gap-3">
                {row.phonemes.map((ph) => (
                  <PhonemeChip
                    key={ph.id}
                    phoneme={ph}
                    maxReached={maxReached}
                    selectedPositions={selections.filter((s) => s.phonemeId === ph.id).map((s) => s.position)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-purple-100 bg-purple-50/60 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onChange([])}
            disabled={selections.length === 0}
            className="rounded-full border-red-400 text-red-600 hover:bg-red-50"
          >
            Clear all
          </Button>
          <span className="text-xs italic text-gray-500">Click phoneme to select positions</span>
          <Button onClick={() => onOpenChange(false)} className="rounded-full bg-purple-500 hover:bg-purple-600 text-white px-6">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}