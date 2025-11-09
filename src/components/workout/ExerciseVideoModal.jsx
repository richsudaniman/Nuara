
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, X } from "lucide-react";

export default function ExerciseVideoModal({ exercise, isOpen, onClose }) {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-2 border-[#0ea5e9] glow-blue">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic text-[#1a1a1a]">{exercise.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-100 border-2 border-[#0ea5e9]/30 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-[#0ea5e9] flex items-center justify-center mb-4 glow-blue-intense" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
                <Play className="w-10 h-10 text-white fill-current" />
              </div>
              <p className="text-[#1a1a1a] font-black italic text-lg">FORM DEMO</p>
              <p className="text-gray-500 text-sm mt-2 italic">(Coming Soon)</p>
            </div>
          </div>

          <div className="bg-gray-50 border-l-4 border-[#0ea5e9] p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">SETS</p>
                <p className="text-3xl font-black italic text-[#0ea5e9]">{exercise.sets}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">REPS</p>
                <p className="text-3xl font-black italic text-[#0ea5e9]">{exercise.reps}</p>
              </div>
            </div>
            {exercise.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">NOTES</p>
                <p className="text-sm text-gray-700">{exercise.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
