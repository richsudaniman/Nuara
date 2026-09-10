import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import RecordingCard from "@/components/recordings/RecordingCard";
import { createPageUrl } from "@/utils";

const MOCK_RECORDINGS = [
  { id: 1, clientName: "Jalal Abdelrahim", activity: "Story retelling", dateLabel: "Thu Apr 30", duration: "1:24", unreviewed: true },
  { id: 2, clientName: "Priya S.", activity: "Sound drill — /r/ words", dateLabel: "Wed Apr 29", duration: "0:48", unreviewed: true },
  { id: 3, clientName: "Amir K.", activity: "Answer questions", dateLabel: "Wed Apr 29", duration: "2:10", unreviewed: false },
  { id: 4, clientName: "Ella C.", activity: "Fluency passage read", dateLabel: "Tue Apr 28", duration: "1:55", unreviewed: false },
];

export default function Recordings() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get("clientName");

  const recordings = clientName
    ? MOCK_RECORDINGS.filter((r) => r.clientName.toLowerCase().startsWith(clientName.toLowerCase().split(" ")[0]))
    : MOCK_RECORDINGS;

  const selected = recordings.find((r) => r.id === selectedId);
  const unreviewedCount = recordings.filter((r) => r.unreviewed).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Recording review</h1>
          <span className="text-sm text-gray-400">{unreviewedCount} unreviewed recordings</span>
          {clientName && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
              {clientName}
              <Link to={createPageUrl("Recordings")} className="hover:text-purple-900">
                <X className="w-3.5 h-3.5" />
              </Link>
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Unreviewed list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {clientName ? `Recordings — ${clientName}` : "Unreviewed recordings"}
          </h3>
          <div className="space-y-3">
            {recordings.length === 0 && (
              <p className="text-sm text-gray-400 py-6 text-center">No recordings for this client yet.</p>
            )}
            {recordings.map((r, idx) => (
              <RecordingCard
                key={r.id}
                recording={r}
                isUnreviewed={r.unreviewed}
                isSelected={selectedId === r.id}
                onClick={() => setSelectedId(r.id)}
                colorIndex={idx}
              />
            ))}
          </div>
        </div>

        {/* Right: Review pane */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 leading-relaxed">
            Select a recording to review
          </h3>
          {selected ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">{selected.clientName}</p>
              <p className="text-xs text-gray-500">{selected.activity}</p>
              <p className="text-xs text-gray-400">{selected.dateLabel} · {selected.duration}</p>
              <Button className="w-full mt-3 bg-gray-900 hover:bg-gray-800 text-white text-sm">
                Mark reviewed
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Tap a recording on the left</p>
          )}
        </div>
      </div>
    </div>
  );
}