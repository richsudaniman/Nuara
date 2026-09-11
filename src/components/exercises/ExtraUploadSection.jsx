import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Paperclip, CheckCircle2, Loader2 } from "lucide-react";

// Lets the patient attach any audio / image / video file and add notes,
// on top of whatever modality the task asks for.
export default function ExtraUploadSection({ fileUrl, onFileUrl, notes, onNotes, hideNotes }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onFileUrl(file_url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {!fileUrl ? (
        <label className="cursor-pointer flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 transition-colors">
          <input type="file" accept="audio/*,image/*,video/*" onChange={handleFile} className="hidden" disabled={uploading} />
          {uploading ? <Loader2 className="w-4 h-4 text-purple-500 animate-spin" /> : <Paperclip className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-semibold text-gray-600">
            {uploading ? "Uploading…" : "Attach audio, image or video"}
          </span>
        </label>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">File attached</span>
          <button onClick={() => onFileUrl(null)} className="ml-auto text-xs text-gray-500 underline">Remove</button>
        </div>
      )}

      {!hideNotes && (
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Add a note for your therapist (optional)…"
          className="w-full h-20 p-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple-400"
        />
      )}
    </div>
  );
}