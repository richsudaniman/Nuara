import React, { useState } from "react";
import { hasMedia } from "@/lib/modalityMeta";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Inline playback for a single submission: audio player, video player or photo + lightbox.
export default function InlineRecordingPreview({ entry, className = "" }) {
  const [lightbox, setLightbox] = useState(false);
  if (!hasMedia(entry)) return null;

  if (entry.modality === "audio") {
    return <audio controls preload="none" src={entry.submission_url} className={`w-full h-9 ${className}`} />;
  }

  if (entry.modality === "video") {
    return (
      <video
        controls
        preload="metadata"
        src={entry.submission_url}
        className={`w-full rounded-xl bg-black max-h-56 ${className}`}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className={`block w-full overflow-hidden rounded-xl border border-[#EFEFF2] ${className}`}
      >
        <img src={entry.submission_url} alt={entry.exercise_name} className="w-full h-40 object-cover" />
      </button>
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-3xl p-2">
          <img src={entry.submission_url} alt={entry.exercise_name} className="w-full rounded-lg" />
        </DialogContent>
      </Dialog>
    </>
  );
}