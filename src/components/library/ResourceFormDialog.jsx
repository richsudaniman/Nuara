import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link2, Loader2, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = ["articulation", "language", "fluency", "voice", "listening", "social", "cognitive", "tutorial", "education"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const MODALITIES = [
  { value: "audio", label: "Audio" },
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "caregiver_note", label: "Caregiver note" },
];

const EMPTY = {
  title: "", description: "", category: "articulation", difficulty_level: "beginner",
  duration_minutes: 0, tags: "", notes: "", default_modality: "audio",
  default_metric_type: "", video_url: "", thumbnail_url: "",
};

export default function ResourceFormDialog({ open, onOpenChange, material, user, onSave, onDelete, saving }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(material ? {
      title: material.title || "",
      description: material.description || "",
      category: material.category || "articulation",
      difficulty_level: material.difficulty_level || "beginner",
      duration_minutes: material.duration_minutes || 0,
      tags: Array.isArray(material.tags) ? material.tags.join(", ") : (material.tags || ""),
      notes: material.notes || "",
      default_modality: material.default_modality || "audio",
      default_metric_type: material.default_metric_type || "",
      video_url: material.video_url || "",
      thumbnail_url: material.thumbnail_url || "",
    } : EMPTY);
  }, [open, material]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { alert("Please select a video file"); e.target.value = ""; return; }
    if (file.size > 500 * 1024 * 1024) { alert("Max 500MB"); e.target.value = ""; return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set("video_url", file_url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) { alert("Title is required"); return; }
    if (!form.video_url.trim()) { alert("Add a video (upload or paste a link)"); return; }
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty_level: form.difficulty_level,
      duration_minutes: parseInt(form.duration_minutes) || 0,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: form.notes.trim(),
      default_modality: form.default_modality,
      default_metric_type: form.default_metric_type.trim(),
      video_url: form.video_url.trim(),
      thumbnail_url: form.thumbnail_url.trim(),
      uploaded_by_trainer_id: user?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{material ? "Edit material" : "New material"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title *</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="mt-1 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (<SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</label>
              <Select value={form.difficulty_level} onValueChange={(v) => set("difficulty_level", v)}>
                <SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (<SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration (min)</label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default modality</label>
              <Select value={form.default_modality} onValueChange={(v) => set("default_modality", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODALITIES.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default metric type</label>
            <Input value={form.default_metric_type} onChange={(e) => set("default_metric_type", e.target.value)} placeholder="e.g. articulation_accuracy" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="r, initial, words" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Practitioner notes / cues</label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="mt-1 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Video *</label>
            {form.video_url ? (
              <div className="mt-1 rounded-lg overflow-hidden bg-black aspect-video">
                <video src={form.video_url} controls className="w-full h-full object-contain" />
              </div>
            ) : (
              <label className="mt-1 cursor-pointer block border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/40 rounded-xl p-5 text-center transition-colors">
                <input type="file" accept="video/*" onChange={handleUpload} className="hidden" />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-600">Click to upload a video</p>
                  </>
                )}
              </label>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-gray-400" />
              <Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="…or paste a video URL" className="h-8 text-xs" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {material && onDelete && (
            <Button variant="destructive" onClick={() => onDelete(material)} className="mr-auto">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || uploading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {material ? "Save changes" : "Create material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}