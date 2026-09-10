import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PublishPanel({ clients, clientId, onClientChange, lockedClient, days, onToggleDay, note, onNoteChange, selectedCount, saving, saved, onPublish }) {
  const canPublish = !!clientId && selectedCount > 0 && days.length > 0 && !saving;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign to</p>
          {lockedClient && <p className="text-base font-bold text-gray-900 mt-0.5">{lockedClient.full_name}</p>}
        </div>
        {!lockedClient && (
          <Select value={clientId || ""} onValueChange={onClientChange}>
            <SelectTrigger className="w-full sm:w-[240px] h-10 rounded-xl border-gray-200">
              <SelectValue placeholder={clients.length ? "Select client" : "No clients in caseload"} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Practice days</p>
        <div className="flex gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => onToggleDay(d)}
              className={`flex-1 h-10 text-xs font-semibold rounded-xl border-2 transition-colors ${
                days.includes(d) ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-purple-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">SLP note to parent</p>
        <Textarea value={note} onChange={(e) => onNoteChange(e.target.value)} rows={3} className="text-sm border-gray-200 rounded-xl resize-none" />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{selectedCount}</span> word cards · {days.length} days / week
        </p>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Published
            </span>
          )}
          <Button onClick={onPublish} disabled={!canPublish} className="h-11 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold">
            {saving ? "Publishing..." : "Publish to client"}
          </Button>
        </div>
      </div>
    </div>
  );
}