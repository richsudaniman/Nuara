import React from "react";
import { Mic, Camera, Video, StickyNote, X } from "lucide-react";
import RepsStepper from "@/components/homework/RepsStepper";

export const MODALITIES = [
  { id: "audio", label: "Audio", icon: Mic },
  { id: "video", label: "Video", icon: Video },
  { id: "photo", label: "Image", icon: Camera },
  { id: "caregiver_note", label: "Note", icon: StickyNote },
];

export default function ResourceTaskRow({ task, onModalityChange, onRepsChange, onRemove }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
      <div className="flex-1 min-w-[180px]">
        <p className="text-sm font-semibold text-gray-900">{task.title}</p>
        <p className="text-[11px] text-gray-500 capitalize">{task.category || "resource"}</p>
      </div>

      <div className="flex gap-1.5">
        {MODALITIES.map((m) => {
          const Icon = m.icon;
          const active = task.modality === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModalityChange(task.id, m.id)}
              title={m.label}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                active ? "bg-purple-50 border-purple-300 text-purple-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {m.label}
            </button>
          );
        })}
      </div>

      <RepsStepper value={task.reps} onChange={(n) => onRepsChange(task.id, n)} />

      <button onClick={() => onRemove(task.id)} className="text-gray-300 hover:text-red-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}