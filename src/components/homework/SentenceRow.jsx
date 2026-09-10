import React from "react";
import { X } from "lucide-react";
import RepsStepper from "@/components/homework/RepsStepper";

export default function SentenceRow({ index, sentence, onRepsChange, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-2.5">
      <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </span>
      <p className="flex-1 text-sm text-gray-800 leading-snug">{sentence.text}</p>
      <RepsStepper value={sentence.reps} onChange={(n) => onRepsChange(sentence.id, n)} />
      <button
        type="button"
        onClick={() => onRemove(sentence.id)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove sentence"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}