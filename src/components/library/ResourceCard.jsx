import React from "react";
import { Clock, Play } from "lucide-react";

const CATEGORY_COLOR = {
  articulation: "bg-purple-500",
  language: "bg-emerald-500",
  fluency: "bg-blue-500",
  voice: "bg-rose-500",
  listening: "bg-amber-500",
  social: "bg-pink-500",
  cognitive: "bg-indigo-500",
  tutorial: "bg-sky-500",
  education: "bg-sky-500",
};

export default function ResourceCard({ material, onOpen }) {
  const color = CATEGORY_COLOR[material.category] || "bg-gray-500";
  return (
    <button
      onClick={() => onOpen(material)}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left overflow-hidden flex flex-col"
    >
      <div className="aspect-video bg-gray-100 relative">
        {material.video_url ? (
          <video src={material.video_url} className="w-full h-full object-cover" preload="metadata" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Play className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {material.duration_minutes > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-bold text-white flex items-center gap-1">
            <Clock className="w-3 h-3" />{material.duration_minutes}m
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">{material.title}</h3>
          <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded text-white ${color}`}>{material.category}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{material.description}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {material.difficulty_level && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 capitalize">{material.difficulty_level}</span>
          )}
          {(material.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-purple-50 text-purple-600">#{t}</span>
          ))}
        </div>
      </div>
    </button>
  );
}