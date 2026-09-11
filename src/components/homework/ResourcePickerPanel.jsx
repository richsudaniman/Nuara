import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Check, Library } from "lucide-react";
import ResourceTaskRow from "@/components/homework/ResourceTaskRow";

const CATEGORIES = ["All", "articulation", "language", "fluency", "voice", "listening", "social", "cognitive", "tutorial"];

export default function ResourcePickerPanel({ tasks, onAdd, onRemove, onModalityChange, onRepsChange }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["therapyActivities"],
    queryFn: () => base44.entities.TherapyActivity.list("-created_date"),
    staleTime: 60 * 1000,
  });

  const filtered = resources.filter((r) => {
    const ms = (r.title || "").toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || r.category === category;
    return ms && mc;
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 py-6 space-y-5">
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500 text-white">STEP 2</span>
        <span className="text-lg font-bold text-gray-900">Pick resources from your library</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search resource library..."
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
                  category === cat ? "bg-purple-50 border-purple-300 text-purple-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center bg-gray-50 rounded-xl">No resources found in the library</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filtered.map((r) => {
                const added = tasks.some((t) => t.id === r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => (added ? onRemove(r.id) : onAdd(r))}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      added ? "bg-purple-50 border-purple-300" : "bg-white border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Library className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{r.category} · {r.difficulty_level || "beginner"}</p>
                    </div>
                    {added ? <Check className="w-4 h-4 text-purple-600" /> : <Plus className="w-4 h-4 text-gray-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Selected tasks ({tasks.length})
          </p>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center bg-gray-50 rounded-xl">
              Add resources, then choose how the patient submits each one
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <ResourceTaskRow
                  key={t.id}
                  task={t}
                  onModalityChange={onModalityChange}
                  onRepsChange={onRepsChange}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}