import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, User } from "lucide-react";
import ActivityLibrary from "@/components/homework/ActivityLibrary";
import AssignmentBuilder from "@/components/homework/AssignmentBuilder";

export default function HomeworkBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");

  const [assigned, setAssigned] = useState([
    { id: "sound-drill-r", name: "Sound drill — /r/ words", reps: 20, icon: () => null, color: "bg-purple-500" },
    { id: "sentence-builder-3", name: "Sentence builder level 3", reps: 5, icon: () => null, color: "bg-emerald-500" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: therapist } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const all = await base44.entities.User.list();
      return all.find((u) => u.id === patientId) || null;
    },
    enabled: !!patientId,
  });

  const handleSelect = (activity) => {
    setSaved(false);
    setAssigned((prev) => {
      if (prev.find((a) => a.id === activity.id)) return prev;
      return [...prev, { ...activity, reps: 10 }];
    });
  };

  const handleRemove = (id) => {
    setSaved(false);
    setAssigned((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateReps = (id, reps) => {
    setAssigned((prev) => prev.map((a) => (a.id === id ? { ...a, reps } : a)));
  };

  const handleAssign = async () => {
    if (!patientId || assigned.length === 0) return;
    setSaving(true);
    try {
      await base44.entities.TherapyPlan.create({
        assigned_to_client_id: patientId,
        created_by_trainer_id: therapist?.id,
        day_of_week: "Monday",
        workout_type: "Homework",
        order: 1,
        exercises: assigned.map((a) => ({
          name: a.name,
          reps: a.reps,
          sets: 1,
        })),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const selectedId = assigned.length > 0 ? assigned[assigned.length - 1].id : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Homework builder</h1>
          {patient ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              <User className="w-3.5 h-3.5" />
              {patient.full_name}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Assign activities to clients</span>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActivityLibrary selectedId={selectedId} onSelect={handleSelect} />
        <AssignmentBuilder
          assignedActivities={assigned}
          onRemove={handleRemove}
          onUpdateReps={handleUpdateReps}
        />
      </div>

      {patient && (
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Assigned to {patient.full_name}
            </span>
          )}
          <Button
            onClick={handleAssign}
            disabled={saving || assigned.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? "Assigning..." : `Assign ${assigned.length} activities`}
          </Button>
        </div>
      )}
    </div>
  );
}