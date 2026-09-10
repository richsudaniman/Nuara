import React from "react";
import { Volume2, Waves, BookOpen, GitCompareArrows } from "lucide-react";

export const HOMEWORK_TYPES = [
  { id: "articulation", label: "Articulation", description: "Word cards by target sound and position", icon: Volume2, metric: "articulation_accuracy" },
  { id: "minimal_pairs", label: "Minimal Pairs", description: "Contrast two sounds with paired words", icon: GitCompareArrows, metric: "contrast_accuracy" },
  { id: "fluency", label: "Fluency", description: "Passage practice with a strategy target", icon: Waves, metric: "fluency_rate" },
  { id: "reading", label: "Reading", description: "Read-aloud passage, one sentence at a time", icon: BookOpen, metric: "reading_accuracy" },
];

export default function HomeworkTypeStep({ value, onChange }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 py-6">
      <div className="flex items-center gap-4 mb-5">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500 text-white">START</span>
        <span className="text-lg font-bold text-gray-900">What are you assigning?</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HOMEWORK_TYPES.map((t) => {
          const Icon = t.icon;
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`text-left rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                active ? "border-purple-400 bg-purple-50/60 shadow-md" : "border-gray-100 bg-white shadow-sm hover:border-purple-200"
              }`}
            >
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"}`}>
                <Icon className="w-5 h-5" />
              </span>
              <p className="text-base font-bold text-gray-900">{t.label}</p>
              <p className="text-sm text-gray-500 mt-1">{t.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}