import React, { useState } from "react";
import { modalityMeta, hasMedia } from "@/lib/modalityMeta";
import InlineRecordingPreview from "@/components/recordings/InlineRecordingPreview";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "photo", label: "Photos" },
  { id: "caregiver_note", label: "Notes" },
];

// Full gallery of every submission for a client, filterable by modality.
export default function RecordingsGallery({ entries = [] }) {
  const [filter, setFilter] = useState("all");

  const sorted = [...entries].sort((a, b) => (a.completed_date < b.completed_date ? 1 : -1));
  const visible = filter === "all" ? sorted : sorted.filter((e) => e.modality === filter);

  return (
    <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#0F0F12]">All recordings</h3>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">{sorted.length} submissions on file</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? sorted.length : sorted.filter((e) => e.modality === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                  active ? "bg-[#A78BFA] text-white" : "bg-[#FAFAFB] text-[#6B6B75] hover:bg-[#F1F1F4]"
                }`}
              >
                {f.label} <span className={active ? "text-white/70" : "text-[#9CA3AF]"}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-[13px] text-[#9CA3AF] text-center py-10">No recordings in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map((e) => {
            const meta = modalityMeta(e.modality);
            const Icon = meta.icon;
            return (
              <div key={e.id} className="border border-[#EFEFF2] rounded-xl bg-[#FAFAFB] p-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F0F12] truncate">{e.exercise_name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{e.completed_date} · {meta.label}</p>
                  </div>
                  {e.metric_value != null && (
                    <span className="text-[13px] font-bold text-[#A78BFA] flex-shrink-0">{e.metric_value}%</span>
                  )}
                </div>

                <InlineRecordingPreview entry={e} />

                {!hasMedia(e) && (
                  <p className="text-[12px] text-[#6B6B75] bg-white border border-[#EFEFF2] rounded-lg px-3 py-2">
                    {e.notes || "No media attached to this submission."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}