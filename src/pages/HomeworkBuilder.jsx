import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ActivityLibrary from "@/components/homework/ActivityLibrary";
import AssignmentBuilder from "@/components/homework/AssignmentBuilder";

export default function HomeworkBuilder() {
  const [assigned, setAssigned] = useState([
    { id: "sound-drill-r", name: "Sound drill — /r/ words", reps: 20, icon: () => null, color: "bg-purple-500" },
    { id: "sentence-builder-3", name: "Sentence builder level 3", reps: 5, icon: () => null, color: "bg-emerald-500" },
  ]);

  const handleSelect = (activity) => {
    setAssigned((prev) => {
      if (prev.find((a) => a.id === activity.id)) return prev;
      return [...prev, { ...activity, reps: 10 }];
    });
  };

  const handleRemove = (id) => {
    setAssigned((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateReps = (id, reps) => {
    setAssigned((prev) => prev.map((a) => (a.id === id ? { ...a, reps } : a)));
  };

  const selectedId = assigned.length > 0 ? assigned[assigned.length - 1].id : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Homework builder</h1>
          <span className="text-sm text-gray-400">Assign activities to clients</span>
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
    </div>
  );
}