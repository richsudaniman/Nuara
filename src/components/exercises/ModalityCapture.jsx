import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, CheckCircle2, Camera, Video, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function ModalityCapture({ modality, submissionUrl, onSubmissionUrl, note, onNote }) {
  const { toast } = useToast();
  const [rec, setRec] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (rec === "recording") timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [rec]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onSubmissionUrl(file_url);
    } catch {
      toast({ title: "Upload failed", description: "Please try again." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (modality === "caregiver_note") {
    return (
      <textarea
        value={note}
        onChange={(e) => onNote(e.target.value)}
        placeholder="How did it go? Any notes for the therapist…"
        className="w-full h-28 p-3 font-body text-[16px] border border-[#E4E4E7] rounded-xl resize-none focus:outline-none focus:border-[#8B5CF6]"
      />
    );
  }

  if (modality === "photo" || modality === "video") {
    if (submissionUrl) {
      return (
        <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0]">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span className="font-body text-[13px] font-semibold text-[#047857]">Ready to submit</span>
          <button onClick={() => onSubmissionUrl(null)} className="ml-auto font-body text-[13px] text-[#71717A] underline min-h-[44px] px-2">Remove</button>
        </div>
      );
    }
    const Icon = modality === "photo" ? Camera : Video;
    return (
      <label className="cursor-pointer block">
        <input type="file" accept={modality === "photo" ? "image/*" : "video/*"} onChange={handleFile} className="hidden" disabled={uploading} />
        <div className="flex flex-col items-center gap-2 py-7 rounded-xl border-2 border-dashed border-[#DDD6FE] hover:bg-[#F5F3FF]">
          {uploading ? <Loader2 className="w-7 h-7 text-[#8B5CF6] animate-spin" /> : <Icon className="w-7 h-7 text-[#8B5CF6]" />}
          <span className="font-body text-[14px] font-semibold text-[#3F3F46]">{uploading ? "Uploading…" : `Tap to choose a ${modality}`}</span>
        </div>
      </label>
    );
  }

  if (rec === "recording") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
          <div className="relative w-14 h-14 rounded-full bg-red-500 flex items-center justify-center"><Mic className="w-7 h-7 text-white" /></div>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums">{fmt(seconds)}</p>
        <Button onClick={() => setRec("recorded")} variant="outline" className="gap-2 min-h-[44px]"><Square className="w-4 h-4 fill-current" /> Stop</Button>
      </div>
    );
  }
  if (rec === "recorded") {
    return (
      <div className="flex items-center gap-3 p-3 bg-[#F5F3FF] rounded-xl">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center"><Play className="w-4 h-4 text-white fill-white ml-0.5" /></div>
        <p className="font-body text-[14px] text-[#3F3F46] tabular-nums flex-1">Recording · {fmt(seconds)}</p>
        <Button variant="ghost" size="icon" className="w-11 h-11" onClick={() => { setRec("idle"); setSeconds(0); }}><Trash2 className="w-4 h-4" /></Button>
      </div>
    );
  }
  return (
    <button onClick={() => { setSeconds(0); setRec("recording"); }} className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#DDD6FE] hover:bg-[#F5F3FF]">
      <div className="w-14 h-14 rounded-full bg-[#8B5CF6] flex items-center justify-center"><Mic className="w-7 h-7 text-white" /></div>
      <span className="font-body text-[14px] font-semibold text-[#3F3F46]">Tap to start recording</span>
    </button>
  );
}