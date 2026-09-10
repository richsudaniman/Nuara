import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StickyNote } from "lucide-react";

// Inline preview for a submission: audio player, video player, photo lightbox.
export default function SubmissionPreview({ entry, compact = false }) {
  const [lightbox, setLightbox] = useState(false);
  const url = entry?.submission_url;

  if (entry?.modality === "caregiver_note") {
    return (
      <div className="flex items-start gap-2 text-[12px] text-[#6B6B75] bg-[#FAFAFB] border border-[#EFEFF2] rounded-xl px-3 py-2">
        <StickyNote className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
        <span>{entry.notes || "Caregiver note — no recording attached."}</span>
      </div>
    );
  }

  if (!url) {
    return <p className="text-[12px] text-[#9CA3AF]">No recording attached.</p>;
  }

  if (entry.modality === "video") {
    return <video src={url} controls className={`w-full rounded-xl bg-black ${compact ? "max-h-32" : "max-h-56"}`} />;
  }

  if (entry.modality === "photo") {
    return (
      <>
        <button onClick={() => setLightbox(true)} className="block w-full">
          <img
            src={url}
            alt={entry.exercise_name}
            className={`w-full object-cover rounded-xl border border-[#EFEFF2] ${compact ? "h-24" : "h-40"}`}
          />
        </button>
        <Dialog open={lightbox} onOpenChange={setLightbox}>
          <DialogContent className="max-w-3xl p-2">
            <img src={url} alt={entry.exercise_name} className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <audio src={url} controls className="w-full h-9" />;
}