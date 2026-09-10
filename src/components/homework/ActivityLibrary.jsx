import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Mic, BookOpen, Wind, Volume2, Ear, MessageCircle, Brain, GraduationCap, Send, Sparkles, Library } from "lucide-react";

const CATEGORY_META = {
  articulation: { icon: Mic, color: "bg-purple-500" },
  language: { icon: BookOpen, color: "bg-emerald-500" },
  fluency: { icon: Wind, color: "bg-blue-500" },
  voice: { icon: Volume2, color: "bg-rose-500" },
  listening: { icon: Ear, color: "bg-amber-500" },
  social: { icon: MessageCircle, color: "bg-pink-500" },
  cognitive: { icon: Brain, color: "bg-indigo-500" },
  tutorial: { icon: GraduationCap, color: "bg-sky-500" },
  education: { icon: GraduationCap, color: "bg-sky-500" },
};

const POINTS = { beginner: 10, intermediate: 15, advanced: 20 };

const STARTER = [
  { id: "sound-drill-r", name: "Sound drill — /r/ words", category: "articulation", level: "Word level", difficulty: "Beginner", points: 10, icon: Mic, color: "bg-purple-500", modality: "audio", metric_type: "articulation_accuracy" },
  { id: "tongue-twisters-r", name: "Tongue twisters — /r/", category: "articulation", level: "Phrase level", difficulty: "Intermediate", points: 15, icon: Send, color: "bg-purple-400", modality: "audio", metric_type: "articulation_accuracy" },
  { id: "sentence-builder-3", name: "Sentence builder level 3", category: "language", level: "Sentence level", difficulty: "Intermediate", points: 15, icon: BookOpen, color: "bg-emerald-500", modality: "audio", metric_type: "sentence_length" },
  { id: "story-retelling", name: "Story retelling + record", category: "articulation", level: "Carryover", difficulty: "Advanced", points: 20, icon: Volume2, color: "bg-orange-500", modality: "video", metric_type: "articulation_accuracy" },
  { id: "answer-questions", name: "Answer questions", category: "language", level: "Comprehension", difficulty: "Beginner", points: 10, icon: MessageCircle, color: "bg-blue-500", modality: "caregiver_note", metric_type: null },
  { id: "sound-match", name: "Sound match challenge", category: "articulation", level: "Game", difficulty: "Beginner", points: 10, icon: Sparkles, color: "bg-purple-300", modality: "audio", metric_type: null },
];

const CATEGORIES = ["All", "articulation", "language", "fluency", "voice", "listening", "social", "cognitive"];

export default function ActivityLibrary({ selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["therapyActivities"],
    queryFn: () => base44.entities.TherapyActivity.list("-created_date"),
    staleTime: 60 * 1000,
  });

  const curated = materials.map((m) => {
    const meta = CATEGORY_META[m.category] || { icon: Library, color: "bg-gray-500" };
    return {
      id: m.id,
      activity_id: m.id,
      name: m.title,
      category: m.category,
      level: (m.difficulty_level || "beginner") + " level",
      difficulty: m.difficulty_level || "beginner",
      points: POINTS[m.difficulty_level] || 10,
      icon: meta.icon,
      color: meta.color,
      modality: m.default_modality || "audio",
      metric_type: m.default_metric_type || null,
      description: m.description,
      tags: m.tags,
    };
  });

  const list = curated.length > 0 ? curated : STARTER;

  const filtered = list.filter((a) => {
    const ms = a.name.toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || (a.category || "").toLowerCase() === category;
    return ms && mc;
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
            className={`text-xs font-medium px-3 py-1 rounded-full border capitalize transition-colors ${
              category === cat
                ? "bg-purple-50 border-purple-300 text-purple-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-16 rounded-lg" />))}
        </div>
      ) : filtered.length > 0 ? (
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
                  <p className="text-[11px] text-gray-500 mt-0.5 capitalize">{a.category} · {a.level} · {a.difficulty}</p>
                </div>
                <span className="text-xs font-semibold text-purple-600 flex-shrink-0">+{a.points} pts</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-lg">No activities found</p>
      )}
    </div>
  );
}