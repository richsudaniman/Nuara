import React from "react";

const SYLLABLES = [
  { id: "any", label: "Any" },
  { id: "1", label: "1 syllable" },
  { id: "2", label: "2 syllables" },
  { id: "3+", label: "3+ syllables" },
];
const LIMITS = [
  { id: null, label: "All words" },
  { id: 2, label: "2 per sound" },
  { id: 4, label: "4 per sound" },
];

function ChipRow({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.id)}
            onClick={() => onChange(o.id)}
            className={`px-4 h-9 rounded-full border-2 text-sm font-semibold transition-colors ${
              value === o.id ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-purple-200 text-gray-700 hover:border-purple-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RefineFilters({ filters, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
      <ChipRow label="Word length" options={SYLLABLES} value={filters.syllables} onChange={(v) => onChange({ ...filters, syllables: v })} />
      <ChipRow label="Cards per sound" options={LIMITS} value={filters.maxPerSound} onChange={(v) => onChange({ ...filters, maxPerSound: v })} />
    </div>
  );
}