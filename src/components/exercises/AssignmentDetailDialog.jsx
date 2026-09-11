import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Send, Trash2, CheckCircle2, Repeat, Info, Camera, Video, StickyNote, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Modality-aware completion dialog. Calls onComplete(payload) where payload
// contains { modality, submissionUrl, metricValue, notes } captured from the patient.
export default function AssignmentDetailDialog({ exercise, open, onOpenChange, onComplete, isCompleted }) {
  const modality = exercise?.modality || "audio";
  const [recordingState, setRecordingState] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState(null);
  const [caregiverNote, setCaregiverNote] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const intervalRef = useRef(null);

  React.useEffect(() => {
    if (recordingState === "recording") {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [recordingState]);

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setRecordingState("idle");
        setSeconds(0);
        setSubmissionUrl(null);
        setCaregiverNote("");
        setMetricValue("");
      }, 200);
    }
  }, [open]);

  if (!exercise) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const showMetric = !!(exercise.metric_type || exercise.goal_id);

  const handleStart = () => { setSeconds(0); setRecordingState("recording"); };
  const handleStop = () => setRecordingState("recorded");
  const handleDiscard = () => { setRecordingState("idle"); setSeconds(0); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setSubmissionUrl(file_url);
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const buildPayload = () => ({
    modality,
    submission_url: submissionUrl,
    notes: modality === "caregiver_note" ? caregiverNote : undefined,
    metric_value: metricValue !== "" ? Number(metricValue) : undefined,
  });

  const handleSubmitAndComplete = () => {
    if (onComplete) onComplete(buildPayload());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg pr-6 text-left">{exercise.name}</DialogTitle>
        </DialogHeader>

        {/* Modality + quick stats */}
        <div className="flex flex-wrap gap-2 mt-1">
          <ModalityBadge modality={modality} />
          {exercise.reps && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Repeat {exercise.reps} times
            </span>
          )}
          {exercise.sets && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">{exercise.sets} sets</span>
          )}
        </div>

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

        {exercise.video_url && (
          <video src={exercise.video_url} controls className="w-full rounded-xl border border-gray-100 bg-black" />
        )}

        {/* Modality-specific submission */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5">
          {modality === "audio" && (
            <>
              <p className="text-sm font-bold text-gray-900 mb-1">Send a voice memo</p>
              <p className="text-xs text-gray-500 mb-3">Record yourself and send to your therapist</p>
              {recordingState === "idle" && (
                <button onClick={handleStart} className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition-colors">
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
                  <Button onClick={handleStop} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                    <Square className="w-4 h-4 fill-current" /> Stop
                  </Button>
                </div>
              )}
              {recordingState === "recorded" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                    <p className="text-xs text-gray-600 tabular-nums">{formatTime(seconds)}</p>
                  </div>
                  <Button onClick={handleDiscard} variant="outline" className="w-full gap-2">
                    <Trash2 className="w-4 h-4" /> Discard
                  </Button>
                </div>
              )}
            </>
          )}

          {(modality === "photo" || modality === "video") && (
            <>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {modality === "photo" ? "Upload a photo" : "Upload a video"}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {modality === "photo" ? "Capture or choose a photo to submit" : "Record or choose a video to submit"}
              </p>
              {!submissionUrl ? (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept={modality === "photo" ? "image/*" : "video/*"}
                    onChange={handleFile}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition-colors">
                    {uploading ? <Loader2 className="w-7 h-7 text-purple-500 animate-spin" /> : (
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                        {modality === "photo" ? <Camera className="w-6 h-6 text-purple-600" /> : <Video className="w-6 h-6 text-purple-600" />}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {uploading ? "Uploading…" : "Tap to choose"}
                    </span>
                  </div>
                </label>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Ready to submit</span>
                    <button onClick={() => setSubmissionUrl(null)} className="ml-auto text-xs text-gray-500 underline">Remove</button>
                  </div>
                </div>
              )}
            </>
          )}

          {modality === "caregiver_note" && (
            <>
              <p className="text-sm font-bold text-gray-900 mb-1">Caregiver note</p>
              <p className="text-xs text-gray-500 mb-3">Share observations or context for the therapist</p>
              <textarea
                value={caregiverNote}
                onChange={(e) => setCaregiverNote(e.target.value)}
                placeholder="How did it go? Any notes for the therapist…"
                className="w-full h-28 p-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple-400"
              />
            </>
          )}
        </div>

        {/* Optional metric capture */}
        {showMetric && (
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
            <label className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-2">
              {exercise.metric_type?.replace(/_/g, " ") || "Accuracy"} (% this session)
            </label>
            <input
              type="number"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder="e.g. 85"
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">Optional — helps track progress toward your goal.</p>
          </div>
        )}

        {/* Mark complete */}
        {!isCompleted && onComplete && (
          <Button onClick={handleSubmitAndComplete} className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Send className="w-4 h-4" /> Submit to therapist
          </Button>
        )}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700 bg-green-50 rounded-lg py-2">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModalityBadge({ modality }) {
  const map = {
    audio: { icon: Mic, label: "Voice memo", cls: "bg-purple-50 text-purple-700" },
    photo: { icon: Camera, label: "Photo", cls: "bg-sky-50 text-sky-700" },
    video: { icon: Video, label: "Video", cls: "bg-emerald-50 text-emerald-700" },
    caregiver_note: { icon: StickyNote, label: "Caregiver note", cls: "bg-orange-50 text-orange-700" },
  };
  const m = map[modality] || map.audio;
  const Icon = m.icon;
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 ${m.cls}`}>
      <Icon className="w-3 h-3" /> {m.label}
    </span>
  );
}