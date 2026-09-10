import { Mic, Image as ImageIcon, Video, StickyNote } from "lucide-react";

export const MODALITY_META = {
  audio: { icon: Mic, label: "Voice memo", color: "text-purple-600 bg-purple-50" },
  photo: { icon: ImageIcon, label: "Photo", color: "text-sky-600 bg-sky-50" },
  video: { icon: Video, label: "Video", color: "text-emerald-600 bg-emerald-50" },
  caregiver_note: { icon: StickyNote, label: "Caregiver note", color: "text-orange-600 bg-orange-50" },
};

export const modalityMeta = (m) => MODALITY_META[m] || MODALITY_META.audio;

// Placeholder urls ('#', '') shouldn't render a broken player.
export const hasMedia = (entry) =>
  !!entry?.submission_url && entry.submission_url !== "#" && entry.modality !== "caregiver_note";

export const HOMEWORK_TYPE_LABELS = {
  articulation: "Articulation",
  minimal_pairs: "Minimal pairs",
  fluency: "Fluency",
  reading: "Reading",
};