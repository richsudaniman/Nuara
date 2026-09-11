import React from "react";
import { Library, Wand2 } from "lucide-react";

const SOURCES = [
  { id: "library", label: "Resource library", description: "Assign saved activities from your library", icon: Library },
  { id: "on_the_fly", label: "Made on the fly", description: "Build word cards, minimal pairs or passages now", icon: Wand2 },
];

export default function HomeworkSourceStep({ value, onChange }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 py-6">
      <div className="flex items-center gap-4 mb-5">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500 text-white">START</span>
        <span className="text-lg font-bold text-gray-900">Where is this homework coming from?</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          const active = value === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={`text-left rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                active ? "border-purple-400 bg-purple-50/60 shadow-md" : "border-gray-100 bg-white shadow-sm hover:border-purple-200"
              }`}
            >
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"}`}>
                <Icon className="w-5 h-5" />
              </span>
              <p className="text-base font-bold text-gray-900">{s.label}</p>
              <p className="text-sm text-gray-500 mt-1">{s.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}