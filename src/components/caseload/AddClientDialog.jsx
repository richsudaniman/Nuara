import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FOCUS_AREAS = ["Articulation", "Fluency", "Language", "Voice", "Social", "Cognitive", "Listening"];

const EMPTY = {
  full_name: "",
  email: "",
  age: "",
  diagnosis: "",
  therapy_focus: "Articulation",
  session_schedule: "",
  parent_guardian_name: "",
  phone: "",
};

export default function AddClientDialog({ open, onOpenChange, trainerId, existingClient = null }) {
  const queryClient = useQueryClient();
  const isEdit = !!existingClient;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      setError("");
      if (existingClient) {
        setForm({
          full_name: existingClient.full_name || "",
          email: existingClient.email || "",
          age: existingClient.age ?? "",
          diagnosis: existingClient.diagnosis || "",
          therapy_focus: existingClient.therapy_focus || "Articulation",
          session_schedule: existingClient.session_schedule || "",
          parent_guardian_name: existingClient.parent_guardian_name || "",
          phone: existingClient.phone || "",
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, existingClient]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const data = {
          full_name: form.full_name.trim(),
          diagnosis: form.diagnosis,
          therapy_focus: form.therapy_focus,
          session_schedule: form.session_schedule,
          parent_guardian_name: form.parent_guardian_name,
          phone: form.phone,
        };
        if (form.age !== "") data.age = Number(form.age);
        return base44.entities.User.update(existingClient.id, data);
      }
      const res = await base44.functions.invoke("addClient", { ...form, trainer_id: trainerId });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainerAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["client", existingClient?.id] });
      onOpenChange(false);
    },
    onError: (err) => setError(err.message || "Something went wrong"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim() || (!isEdit && !form.email.trim())) {
      setError("Name and email are required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit client" : "Add new client"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name *</Label>
              <Input id="full_name" value={form.full_name} onChange={set("full_name")} placeholder="Jalal Abdelrahim" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="parent@email.com"
                disabled={isEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={form.age} onChange={set("age")} placeholder="9" />
            </div>
            <div className="space-y-1.5">
              <Label>Therapy focus</Label>
              <Select value={form.therapy_focus} onValueChange={(v) => setForm((f) => ({ ...f, therapy_focus: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={form.diagnosis}
              onChange={set("diagnosis")}
              placeholder="Articulation disorder · /r/ and /s/"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="session_schedule">Session schedule</Label>
              <Input
                id="session_schedule"
                value={form.session_schedule}
                onChange={set("session_schedule")}
                placeholder="2× / week, Tue + Fri"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="parent_guardian_name">Parent / guardian</Label>
            <Input
              id="parent_guardian_name"
              value={form.parent_guardian_name}
              onChange={set("parent_guardian_name")}
              placeholder="Optional"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
              {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}