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
      <DialogContent className="max-w-lg bg-white border-none shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col">
          {/* Video Player Header */}
          <div className="bg-black aspect-video relative flex items-center justify-center group">
            {exercise.video_url ? (
              <video 
                src={exercise.video_url} 
                controls 
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                  <Play className="w-6 h-6 text-gray-400 ml-1" />
                </div>
                <p className="text-sm font-medium">Demo video not available</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900">{exercise.name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Sets</p>
                <p className="text-3xl font-bold text-gray-900">{exercise.sets}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Reps</p>
                <p className="text-3xl font-bold text-gray-900">{exercise.reps}</p>
              </div>
            </div>

            {exercise.notes && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 uppercase tracking-wider font-bold mb-2">Trainer Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{exercise.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}