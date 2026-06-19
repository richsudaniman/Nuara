import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AssignmentBuilder({ assignedActivities, onRemove, onUpdateReps }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedDays, setSelectedDays] = useState(["Tue", "Wed", "Fri"]);
  const [note, setNote] = useState("Focus on the /r/ sound at the start of words this week. Go slowly");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["trainerAssignments", user?.id],
    queryFn: () => base44.entities.PractitionerPatientAssignment.filter({ trainer_id: user.id, is_active: true }),
    enabled: !!user?.id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user?.id,
  });

  const clientIds = assignments.map((a) => a.client_id);
  const clients = allUsers.filter((u) => clientIds.includes(u.id));

  const selectedClientName = clients.find((c) => c.id === selectedClient)?.full_name || "";
  const firstName = selectedClientName.split(" ")[0]?.toUpperCase() || "CLIENT";
  const lastInitial = selectedClientName.split(" ")[1]?.[0]?.toUpperCase() || "";

  const toggleDay = (day) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const totalReps = assignedActivities.reduce((s, a) => s + (a.reps || 0), 0);
  const estMinutes = Math.max(5, Math.round(totalReps * 0.4));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Assign to */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Assign to:{selectedClientName ? ` ${firstName} ${lastInitial}.` : ""}
        </span>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[180px] h-8 text-sm border-gray-200">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Days */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select days</p>
        <div className="flex gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`flex-1 h-9 text-xs font-semibold rounded-lg border transition-colors ${
                selectedDays.includes(d)
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned activities</p>
        {assignedActivities.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-lg">
            Tap an activity on the left to add it
          </p>
        ) : (
          <div className="space-y-2">
            {assignedActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{act.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-500">reps:</span>
                      <Input
                        type="number"
                        value={act.reps}
                        onChange={(e) => onUpdateReps(act.id, parseInt(e.target.value) || 0)}
                        className="h-7 w-20 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(act.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estimated time */}
      {assignedActivities.length > 0 && (
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 mb-4">
          <p className="text-xs text-gray-600">
            Est. daily practice time: <span className="font-semibold text-gray-900">~{estMinutes} min</span> · {selectedDays.length} days / week
          </p>
        </div>
      )}

      {/* Note */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">SLP note to parent</p>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="text-sm border-gray-200 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 border-gray-200">
          Save draft
        </Button>
        <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">Publish to client</Button>
      </div>
    </div>
  );
}