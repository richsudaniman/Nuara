import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Mic, BookOpen, Send, MessageCircle, Volume2, Sparkles } from "lucide-react";

const ACTIVITIES = [
  { id: "sound-drill-r", name: "Sound drill — /r/ words", category: "Articulation", level: "Word level", difficulty: "Beginner", points: 10, icon: Mic, color: "bg-purple-500" },
  { id: "tongue-twisters-r", name: "Tongue twisters — /r/", category: "Articulation", level: "Phrase level", difficulty: "Intermediate", points: 15, icon: Send, color: "bg-purple-400" },
  { id: "sentence-builder-3", name: "Sentence builder level 3", category: "Language", level: "Sentence level", difficulty: "Intermediate", points: 15, icon: BookOpen, color: "bg-emerald-500" },
  { id: "story-retelling", name: "Story retelling + record", category: "Articulation", level: "Carryover", difficulty: "Advanced", points: 20, icon: Volume2, color: "bg-orange-500" },
  { id: "answer-questions", name: "Answer questions", category: "Language", level: "Comprehension", difficulty: "Beginner", points: 10, icon: MessageCircle, color: "bg-blue-500" },
  { id: "sound-match", name: "Sound match challenge", category: "Articulation", level: "Game", difficulty: "Beginner", points: 10, icon: Sparkles, color: "bg-purple-300" },
];

const CATEGORIES = ["All", "Articulation", "Language", "Fluency", "Recording"];

export default function ActivityLibrary({ selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = ACTIVITIES.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "All" || a.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Activity library</h3>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm rounded-lg border-gray-200"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              category === cat
                ? "bg-purple-50 border-purple-300 text-purple-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((a) => {
          const Icon = a.icon;
          const isSelected = selectedId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "bg-purple-50 border-purple-300"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {a.category} · {a.level} · {a.difficulty}
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-600 flex-shrink-0">+{a.points} pts</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}