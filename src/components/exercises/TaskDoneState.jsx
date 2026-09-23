import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

export default function TaskDoneState({ hasNext, onNext, onBack }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6 space-y-4">
      <motion.div
        initial={{ scale: 0, rotate: -120 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
        className="mx-auto w-20 h-20 rounded-full bg-[#FEF3C7] flex items-center justify-center"
      >
        <Star className="w-10 h-10 fill-[#F59E0B] text-[#F59E0B]" />
      </motion.div>
      <div>
        <p className="font-display text-[24px] font-bold text-[#18181B]">{hasNext ? "Great job! +10 ⭐" : "You did it! 🎉"}</p>
        <p className="font-body text-[14px] text-[#71717A] mt-1">
          {hasNext ? "Sent to your therapist. Ready for the next one?" : "That's everything for today. Your therapist will be so proud!"}
        </p>
      </div>
      <div className="space-y-2">
        {hasNext && (
          <Button onClick={onNext} className="w-full min-h-[48px] gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-body text-[15px] font-semibold rounded-xl">
            Next task <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        <Button onClick={onBack} variant="outline" className="w-full min-h-[48px] font-body text-[15px] rounded-xl">
          Back to list
        </Button>
      </div>
    </motion.div>
  );
}