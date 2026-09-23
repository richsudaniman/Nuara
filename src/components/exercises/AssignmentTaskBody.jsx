import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Info, Repeat, Loader2 } from "lucide-react";
import ClinicalChips from "@/components/exercises/ClinicalChips";
import ModalityCapture from "@/components/exercises/ModalityCapture";
import ExtraUploadSection from "@/components/exercises/ExtraUploadSection";
import TaskDoneState from "@/components/exercises/TaskDoneState";

export default function AssignmentTaskBody({ exercise, isCompleted, onComplete, hasNext, onNext, onClose }) {
  const modality = exercise.modality || "audio";
  const [submissionUrl, setSubmissionUrl] = useState(null);
  const [extraUrl, setExtraUrl] = useState(null);
  const [note, setNote] = useState("");
  const [metric, setMetric] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return <TaskDoneState hasNext={hasNext} onNext={onNext} onBack={onClose} />;

  const submit = async () => {
    setSaving(true);
    await onComplete({
      modality,
      submission_url: submissionUrl || extraUrl || undefined,
      notes: note || undefined,
      metric_value: metric !== "" ? Number(metric) : undefined,
    });
    setSaving(false);
    setSubmitted(true);
  };

  return (
    <div className="space-y-4 font-body">
      <div className="flex flex-wrap gap-1.5">
        <span className="px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-[12px] font-semibold flex items-center gap-1">
          <Repeat className="w-3 h-3" /> Repeat {exercise.reps || 1} times
        </span>
        <ClinicalChips exercise={exercise} />
      </div>

      {exercise.notes && (
        <div className="flex gap-2 p-3.5 rounded-xl bg-[#F5F3FF]">
          <Info className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
          <p className="text-[14px] text-[#3F3F46] leading-relaxed">{exercise.notes}</p>
        </div>
      )}

      {exercise.video_url && <video src={exercise.video_url} controls className="w-full rounded-xl bg-black" />}

      <div className="border border-[#F3F4F6] rounded-xl p-4">
        <ModalityCapture modality={modality} submissionUrl={submissionUrl} onSubmissionUrl={setSubmissionUrl} note={note} onNote={setNote} />
      </div>

      <div className="border border-[#F3F4F6] rounded-xl p-4">
        <p className="text-[14px] font-semibold text-[#18181B] mb-2">Add anything else</p>
        <ExtraUploadSection fileUrl={extraUrl} onFileUrl={setExtraUrl} notes={note} onNotes={setNote} hideNotes={modality === "caregiver_note"} />
      </div>

      {(exercise.metric_type || exercise.goal_id) && (
        <div>
          <label className="text-[12px] font-semibold text-[#6D28D9] uppercase tracking-wider block mb-1.5">
            {(exercise.metric_type || "accuracy").replace(/_/g, " ")} (optional)
          </label>
          <input
            type="number"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="e.g. 85"
            className="w-full h-11 px-3 text-[16px] border border-[#E4E4E7] rounded-xl focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      )}

      {isCompleted ? (
        <div className="flex items-center justify-center gap-2 text-[14px] font-semibold text-[#047857] bg-[#ECFDF5] rounded-xl py-3">
          <CheckCircle2 className="w-4 h-4" /> Completed today
        </div>
      ) : (
        <Button onClick={submit} disabled={saving} className="w-full min-h-[48px] gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[15px] font-semibold rounded-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {hasNext ? "Complete & next" : "Submit to therapist"}
        </Button>
      )}
    </div>
  );
}