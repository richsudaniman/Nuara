import React from "react";
import { motion } from "framer-motion";
import { Mic, Camera, Video, StickyNote, Star, Play } from "lucide-react";
import ArticulationCard from "@/components/exercises/cards/ArticulationCard";
import MinimalPairCard from "@/components/exercises/cards/MinimalPairCard";
import PassageCard from "@/components/exercises/cards/PassageCard";
import ResourceCard from "@/components/exercises/cards/ResourceCard";
import { metaFor } from "@/lib/homeworkDelivery";

const MODALITY = {
  audio: { icon: Mic, label: "Record" },
  photo: { icon: Camera, label: "Photo" },
  video: { icon: Video, label: "Video" },
  caregiver_note: { icon: StickyNote, label: "Caregiver note" },
};
const BODIES = { articulation: ArticulationCard, minimal_pairs: MinimalPairCard, fluency: PassageCard, reading: PassageCard };

export default function ExerciseCard({ exercise, done, onOpen }) {
  const Body = BODIES[exercise.homeworkType] || ResourceCard;
  const mod = MODALITY[exercise.modality] || MODALITY.audio;
  const Icon = mod.icon;
  return (
    <button
      onClick={onOpen}
      className={`w-full flex items-start gap-3 p-4 border rounded-2xl text-left transition-all active:scale-[0.99] ${
        done ? "border-[#EDE9FE] bg-[#F5F3FF]" : "border-[#F3F4F6] bg-white hover:border-[#DDD6FE]"
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAFAFB] border border-[#F3F4F6] flex items-center justify-center text-2xl flex-shrink-0">
        {exercise.emoji || metaFor(exercise.homeworkType).emoji}
      </div>
      <div className="flex-1 min-w-0">
        <Body exercise={exercise} done={done} />
        <div className="flex items-center gap-1.5 font-body text-[12px] text-[#71717A] mt-2">
          <Icon className="w-3.5 h-3.5" />
          <span>{mod.label} · {exercise.reps || 1} times</span>
        </div>
      </div>
      {done ? (
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
          className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0"
        >
          <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
        </motion.span>
      ) : (
        <span className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </span>
      )}
    </button>
  );
}