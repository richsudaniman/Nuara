import React from "react";
import { modalityMeta, hasMedia } from "@/lib/modalityMeta";
import InlineRecordingPreview from "@/components/recordings/InlineRecordingPreview";

// Lists submitted work (TherapyLog entries) feeding a metric/goal, with inline playback.
export default function SubmittedWorkFeed({ entries = [] }) {
  const sorted = [...entries].sort((a, b) =>
    a.completed_date < b.completed_date ? 1 : a.completed_date > b.completed_date ? -1 : 0
  );

  return (
    <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
      <h3 className="text-[15px] font-semibold text-[#0F0F12] mb-1">Submitted work</h3>
      <p className="text-[12px] text-[#9CA3AF] mb-4">The practice that produced these metrics</p>

      {sorted.length === 0 ? (
        <p className="text-[13px] text-[#9CA3AF] text-center py-6">No submissions logged yet.</p>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((e) => {
            const meta = modalityMeta(e.modality);
            const Icon = meta.icon;
            return (
              <div key={e.id} className="p-3 border border-[#EFEFF2] rounded-xl bg-[#FAFAFB] space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F0F12] truncate">{e.exercise_name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {e.completed_date} · {meta.label}
                      {e.notes ? ` · ${e.notes.slice(0, 40)}${e.notes.length > 40 ? "…" : ""}` : ""}
                    </p>
                  </div>
                  {e.metric_value != null && (
                    <span className="text-[13px] font-bold text-[#A78BFA] flex-shrink-0">{e.metric_value}%</span>
                  )}
                </div>

                {hasMedia(e) && <InlineRecordingPreview entry={e} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}