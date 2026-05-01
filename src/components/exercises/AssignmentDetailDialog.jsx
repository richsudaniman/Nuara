import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Send, Trash2, CheckCircle2, Repeat, Info } from "lucide-react";

export default function AssignmentDetailDialog({ exercise, open, onOpenChange, onComplete, isCompleted }) {
  const [recordingState, setRecordingState] = useState("idle"); // idle | recording | recorded | sent
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (recordingState === "recording") {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [recordingState]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setRecordingState("idle");
        setSeconds(0);
      }, 200);
    }
  }, [open]);

  if (!exercise) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleStart = () => {
    setSeconds(0);
    setRecordingState("recording");
  };
  const handleStop = () => setRecordingState("recorded");
  const handleDiscard = () => {
    setRecordingState("idle");
    setSeconds(0);
  };
  const handleSend = () => {
    setRecordingState("sent");
    setTimeout(() => onOpenChange(false), 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg pr-6 text-left">{exercise.name}</DialogTitle>
        </DialogHeader>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-2 mt-1">
          {exercise.reps && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Repeat {exercise.reps} times
            </span>
          )}
          {exercise.sets && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
              {exercise.sets} sets
            </span>
          )}
          {exercise.hold_duration && (
            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md text-xs font-semibold">
              Hold {exercise.hold_duration}s
            </span>
          )}
        </div>

        {/* Instructions */}
        {exercise.notes && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Instructions</p>
                <p className="text-sm text-gray-700 leading-relaxed">{exercise.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice memo section */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Send a voice memo</p>
              <p className="text-xs text-gray-500">Record yourself and send to your therapist</p>
            </div>
          </div>

          {recordingState === "idle" && (
            <button
              onClick={handleStart}
              className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Tap to start recording</span>
            </button>
          )}

          {recordingState === "recording" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>
                <div className="relative w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatTime(seconds)}</p>
              <p className="text-xs text-red-600 font-semibold">● Recording…</p>
              <Button onClick={handleStop} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                <Square className="w-4 h-4 fill-current" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === "recorded" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </button>
                <div className="flex-1">
                  <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-purple-600 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 tabular-nums">{formatTime(seconds)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDiscard} variant="outline" className="flex-1 gap-2">
                  <Trash2 className="w-4 h-4" />
                  Discard
                </Button>
                <Button onClick={handleSend} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2">
                  <Send className="w-4 h-4" />
                  Send to therapist
                </Button>
              </div>
            </div>
          )}

          {recordingState === "sent" && (
            <div className="py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Voice memo sent!</p>
              <p className="text-xs text-gray-500 mt-0.5">Your therapist will review it soon</p>
            </div>
          )}
        </div>

        {/* Mark complete */}
        {!isCompleted && onComplete && (
          <Button
            onClick={() => {
              onComplete();
              onOpenChange(false);
            }}
            variant="outline"
            className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as complete
          </Button>
        )}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700 bg-green-50 rounded-lg py-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}