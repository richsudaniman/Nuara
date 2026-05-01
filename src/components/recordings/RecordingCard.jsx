import React from "react";

const AVATAR_COLORS = ["bg-purple-100 text-purple-700", "bg-purple-200 text-purple-800", "bg-rose-100 text-rose-700", "bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700"];

function Waveform({ active }) {
  // Static waveform pattern
  const heights = [30, 60, 45, 80, 55, 90, 40, 70, 85, 50, 75, 35, 65, 95, 45, 70, 55, 80, 40, 60];
  return (
    <div className="flex items-center gap-[2px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full ${active ? "bg-purple-500" : "bg-purple-400"}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export default function RecordingCard({ recording, isUnreviewed, isSelected, onClick, colorIndex = 0 }) {
  const initials = recording.clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border transition-all ${
        isSelected ? "border-purple-400 shadow-sm" : "border-gray-200 hover:border-gray-300"
      } ${isUnreviewed ? "border-l-4 border-l-purple-500" : ""}`}
    >
      <div className="flex items-center gap-3 p-4">
        <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{recording.clientName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {recording.activity} · {recording.dateLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Waveform active={isSelected} />
          <span className="text-xs text-gray-500 font-mono w-9 text-right">{recording.duration}</span>
        </div>
      </div>
    </button>
  );
}