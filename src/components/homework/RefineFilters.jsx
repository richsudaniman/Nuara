import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { STRUCTURE_PRESETS } from "@/lib/wordBank";

const SYLLABLES = ["1", "2", "3", "4", "5+"];

const WORD_CATEGORIES = [
  "Animals", "Places", "Countries", "Cities", "Dinosaurs", "Vehicles", "Ocean", "Space & Planets", "Sports",
  "Characters", "Pokémon", "Video Games", "Fantasy", "Nature & Outdoors", "Brands", "Scientific", "Names", "Food",
  "Special Events", "Technology",
];

export default function RefineFilters({ filters, onChange }) {
  const [structureInput, setStructureInput] = useState("");
  const syllables = filters.syllables || [];
  const structures = filters.structures || [];

  const toggle = (key, list, value) =>
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] });

  const addStructure = () => {
    const token = structureInput.trim().toUpperCase().replace(/[^CV]/g, "");
    if (!token || structures.includes(token)) return setStructureInput("");
    onChange({ ...filters, structures: [...structures, token] });
    setStructureInput("");
  };

  return (
    <div className="space-y-6 py-2 pb-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Syllable count</p>
        <div className="grid grid-cols-5 gap-3">
          {SYLLABLES.map((s) => (
            <button
              key={s}
              onClick={() => toggle("syllables", syllables, s)}
              className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                syllables.includes(s) ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-gray-200 text-gray-800 hover:border-purple-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Word structure</p>
        <div className="flex">
          <Input
            value={structureInput}
            onChange={(e) => setStructureInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addStructure()}
            placeholder="Type structure (e.g., CVCC)"
            className="h-11 rounded-l-lg rounded-r-none border-gray-200 text-sm"
          />
          <button
            onClick={addStructure}
            className="h-11 px-5 rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Add +
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {STRUCTURE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle("structures", structures, p.id)}
              className={`px-4 h-10 rounded-lg border text-sm font-semibold transition-colors ${
                structures.includes(p.id) ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-gray-200 text-gray-800 hover:border-purple-300"
              }`}
            >
              {p.label}
            </button>
          ))}
          {structures
            .filter((s) => !STRUCTURE_PRESETS.some((p) => p.id === s))
            .map((s) => (
              <button
                key={s}
                onClick={() => toggle("structures", structures, s)}
                className="px-4 h-10 rounded-lg border border-purple-500 bg-purple-500 text-white text-sm font-semibold"
              >
                {s} ×
              </button>
            ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          Word category <Lock className="w-3 h-3 text-gray-400" />
        </p>
        <div className="flex flex-wrap gap-2">
          {WORD_CATEGORIES.map((c) => (
            <span
              key={c}
              title="Coming soon"
              className="px-3 h-9 inline-flex items-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400 cursor-not-allowed"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}