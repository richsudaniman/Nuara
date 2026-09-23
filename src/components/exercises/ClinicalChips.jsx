import React from "react";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function getClinicalChips(ex) {
  const chips = [];
  const type = ex.homeworkType;
  if (ex.phoneme) {
    const label = ex.phoneme.includes(" vs ")
      ? ex.phoneme.split(" vs ").map((s) => `/${s}/`).join(" vs ")
      : `/${ex.phoneme}/`;
    chips.push({ label, mono: true });
  }
  if (ex.position) chips.push({ label: `${cap(ex.position)} position` });
  if (ex.ipa) chips.push({ label: `[${ex.ipa}]`, mono: true });
  if (ex.strategyTarget) {
    const parts = ex.strategyTarget.split(" · ");
    // Minimal pairs: first part is the contrast (already shown as phoneme)
    const extra = type === "minimal_pairs" ? parts.slice(1) : type === "fluency" || type === "reading" ? parts : [];
    extra.forEach((p) => chips.push({ label: p, mono: /wpm/.test(p) }));
  }
  return chips;
}

export default function ClinicalChips({ exercise, className = "" }) {
  const chips = getClinicalChips(exercise);
  if (chips.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {chips.map((c) => (
        <span
          key={c.label}
          className={`px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#3F3F46] text-[12px] ${c.mono ? "font-mono" : "font-body font-medium"}`}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}