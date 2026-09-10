import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PHONEME_TABS } from "@/lib/wordBank";

export default function SoundPickerDialog({ open, onOpenChange, value, onSelect, accent = "purple" }) {
  const [tab, setTab] = useState("consonants");
  const activeTab = PHONEME_TABS.find((t) => t.id === tab);
  const activeCls = accent === "gold" ? "bg-amber-600 text-white" : "bg-purple-500 text-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="px-5 py-3 bg-purple-50/60 flex gap-2 border-b border-purple-100 pr-14">
          {PHONEME_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 h-11 rounded-xl text-sm font-bold transition-colors ${
                tab === t.id ? activeCls : "bg-white text-purple-600 hover:bg-purple-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
          {activeTab.rows.map((row) => (
            <div key={row.label} className="flex gap-6 px-6 py-5">
              <span className="w-28 flex-shrink-0 text-sm text-gray-500 pt-2">{row.label}</span>
              <div className="flex flex-wrap gap-3">
                {row.phonemes.map((ph) => {
                  const selected = value === ph.id;
                  return (
                    <button
                      key={ph.id}
                      onClick={() => {
                        onSelect(ph.id);
                        onOpenChange(false);
                      }}
                      className={`min-w-[76px] h-11 px-4 rounded-full border-2 text-sm font-bold transition-colors ${
                        selected
                          ? accent === "gold"
                            ? "bg-amber-50 border-amber-600 text-amber-800"
                            : "bg-purple-50 border-purple-600 text-purple-800"
                          : "bg-white border-purple-200 text-gray-800 hover:border-purple-400"
                      }`}
                    >
                      /{ph.ipa}/
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-purple-100 bg-purple-50/60 text-center">
          <span className="text-xs italic text-gray-500">Click to select phoneme</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}