import React from "react";

const META = {
  articulation: { label: "Articulation", color: "bg-purple-50 text-purple-700" },
  minimal_pairs: { label: "Minimal pairs", color: "bg-sky-50 text-sky-700" },
  fluency: { label: "Fluency", color: "bg-emerald-50 text-emerald-700" },
  reading: { label: "Reading", color: "bg-orange-50 text-orange-700" },
};

export default function HomeworkTypeBadge({ type }) {
  const meta = META[type];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  );
}