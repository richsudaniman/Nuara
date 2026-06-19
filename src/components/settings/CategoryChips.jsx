import React from "react";
import { Check } from "lucide-react";

const ALL_CATEGORIES = [
  "articulation", "language", "fluency", "voice", "listening", "social", "cognitive", "other",
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CategoryChips({ selected = [], onChange }) {
  const toggle = (cat) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              active
                ? "bg-[#A78BFA] text-white shadow-sm"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {active && <Check className="w-3.5 h-3.5" />}
            {cap(cat)}
          </button>
        );
      })}
    </div>
  );
}