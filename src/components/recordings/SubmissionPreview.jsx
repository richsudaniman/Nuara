import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StickyNote, Maximize2 } from "lucide-react";

// Inline preview for a submission: audio player, portrait video, photo lightbox.
export default function SubmissionPreview({ entry, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const url = entry?.submission_url;

  if (entry?.modality === "caregiver_note") {
    return (
      <div className="flex items-start gap-2 text-[12px] leading-snug text-[#6B6B75] bg-[#FAFAFB] border border-[#EFEFF2] rounded-xl px-3 py-2.5">
        <StickyNote className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
        <span>{entry.notes || "Caregiver note — no recording attached."}</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="text-[12px] text-[#9CA3AF] bg-[#FAFAFB] border border-dashed border-[#EFEFF2] rounded-xl px-3 py-2.5">
        No recording attached.
      </div>
    );
  }

  // Media is portrait — keep it in a tidy, centred frame instead of stretching wide.
  if (entry.modality === "video" || entry.modality === "photo") {
    const isVideo = entry.modality === "video";
    return (
      <>
        <div className={`relative rounded-xl overflow-hidden bg-[#F6F5FB] ${compact ? "h-44" : "h-64"}`}>
          {isVideo ? (
            <video
              src={url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={url}
              alt={entry.exercise_name}
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => setExpanded(true)}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/45 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/65 transition-colors"
            aria-label="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogContent className="max-w-md p-0 bg-white border-0 overflow-hidden rounded-2xl">
            {isVideo ? (
              <video src={url} controls autoPlay playsInline className="w-full max-h-[80vh] block" />
            ) : (
              <img src={url} alt={entry.exercise_name} className="w-full max-h-[80vh] object-contain block" />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="bg-[#F6F5FB] border border-[#EFEFF2] rounded-xl px-2.5 py-2">
      <audio src={url} controls preload="metadata" className="w-full h-8" />
    </div>
  );
}