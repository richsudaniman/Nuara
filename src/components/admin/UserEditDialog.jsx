import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserEditDialog({ user, open, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    specialties: user?.specialties || "",
    role: user?.role || "user",
  });

  const set = (key, value) => setForm({ ...form, [key]: value });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Full name</label>
            <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Email</label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Phone</label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Role</label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="trainer">Clinician</SelectItem>
                  <SelectItem value="user">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Specialties</label>
            <Input value={form.specialties} onChange={(e) => set("specialties", e.target.value)} placeholder="e.g., Articulation, Fluency" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Bio / About</label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} className="h-28 resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={isSaving}
            className="bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold px-6"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}