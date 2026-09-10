import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import SentenceRow from "@/components/homework/SentenceRow";

export const STRATEGIES = {
  fluency: ["Easy onsets", "Slow rate", "Light contact", "Stretched speech", "Pausing"],
  reading: ["Read with expression", "Chunking phrases", "Slow rate", "Pausing", "Self-correction"],
};

export function splitSentences(text) {
  return (text.match(/[^.!?\n]+[.!?]*/g) || []).map((s) => s.trim()).filter(Boolean);
}

export default function PassageBuilder({ type, passage, onPassageChange, strategy, onStrategyChange, targetRate, onTargetRateChange, sentences, onRepsChange, onRemove }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500 text-white">STEP 1</span>
        <span className="text-lg font-bold text-gray-900">{type === "fluency" ? "Passage & strategy" : "Reading passage"}</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Passage</p>
        <Textarea
          value={passage}
          onChange={(e) => onPassageChange(e.target.value)}
          rows={5}
          placeholder="Type or paste a passage. Each sentence becomes its own exercise for the client to read and record."
          className="text-sm border-gray-200 rounded-xl resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-5">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Strategy target</p>
          <div className="flex flex-wrap gap-2">
            {STRATEGIES[type].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStrategyChange(s)}
                className={`px-4 h-9 rounded-full border-2 text-sm font-semibold transition-colors ${
                  strategy === s ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-purple-200 text-gray-700 hover:border-purple-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target rate (optional)</p>
          <div className="flex items-center gap-2">
            <Input type="number" min={20} max={250} value={targetRate} onChange={(e) => onTargetRateChange(e.target.value)} placeholder="—" className="h-9 rounded-xl border-gray-200" />
            <span className="text-xs text-gray-500 whitespace-nowrap">wpm</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Exercises ({sentences.length})</p>
          <p className="text-xs text-gray-400">Set repetitions per sentence</p>
        </div>
        {sentences.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
            Sentences will appear here as you type the passage
          </div>
        ) : (
          <div className="space-y-2">
            {sentences.map((s, i) => (
              <SentenceRow key={s.id} index={i} sentence={s} onRepsChange={onRepsChange} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}