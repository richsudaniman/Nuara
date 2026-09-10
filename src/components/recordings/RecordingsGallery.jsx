import React, { useState } from "react";
import { Mic, Image as ImageIcon, Video, StickyNote, Film } from "lucide-react";
import SubmissionPreview from "@/components/recordings/SubmissionPreview";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "audio", label: "Audio", icon: Mic },
  { id: "video", label: "Video", icon: Video },
  { id: "photo", label: "Photo", icon: ImageIcon },
  { id: "caregiver_note", label: "Caregiver note", icon: StickyNote },
];

const ICONS = {
  audio: { icon: Mic, color: "text-purple-600 bg-purple-50" },
  photo: { icon: ImageIcon, color: "text-sky-600 bg-sky-50" },
  video: { icon: Video, color: "text-emerald-600 bg-emerald-50" },
  caregiver_note: { icon: StickyNote, color: "text-orange-600 bg-orange-50" },
};

export default function RecordingsGallery({ entries = [] }) {
  const [filter, setFilter] = useState("all");

  const sorted = [...entries].sort((a, b) => (a.completed_date < b.completed_date ? 1 : -1));
  const shown = filter === "all" ? sorted : sorted.filter((e) => e.modality === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.id === "all" ? sorted.length : sorted.filter((e) => e.modality === f.id).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                active
                  ? "bg-[#A78BFA] border-[#A78BFA] text-white"
                  : "bg-white border-[#EFEFF2] text-[#6B6B75] hover:border-[#A78BFA]"
              }`}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#EFEFF2] py-12 text-center">
          <Film className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] text-[#9CA3AF]">No recordings in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((e) => {
            const meta = ICONS[e.modality] || ICONS.audio;
            const Icon = meta.icon;
            return (
              <div key={e.id} className="bg-white border border-[#EFEFF2] rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F0F12] truncate">{e.exercise_name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{e.completed_date}</p>
                  </div>
                  {e.metric_value != null && (
                    <span className="text-[13px] font-bold text-[#A78BFA] flex-shrink-0">{e.metric_value}</span>
                  )}
                </div>
                <SubmissionPreview entry={e} compact />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}