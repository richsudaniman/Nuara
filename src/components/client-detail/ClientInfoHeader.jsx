import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pencil, Download, Mic, ClipboardList } from "lucide-react";

export default function ClientInfoHeader({ client, clientId, age, sinceDate, focusArea, schedule, onEdit, onDownload }) {
  const initials =
    client.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const facts = [
    { label: "Age", value: age ? `${age} years` : "—" },
    { label: "Focus area", value: focusArea },
    { label: "Diagnosis", value: client.diagnosis || `${focusArea} disorder` },
    { label: "Schedule", value: schedule || "Not set" },
    { label: "In care since", value: sinceDate || "—" },
    { label: "Email", value: client.email || "—" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{client.full_name || "Client"}</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Active</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {[age ? `Age ${age}` : null, focusArea, sinceDate ? `Since ${sinceDate}` : null].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {clientId && (
            <Button onClick={onEdit} variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          )}
          <Button onClick={onDownload} variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Download report
          </Button>
          <Link to={`${createPageUrl("Recordings")}?clientId=${clientId || ""}&clientName=${encodeURIComponent(client.full_name || "")}`}>
            <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
              <Mic className="w-4 h-4" /> View recordings
            </Button>
          </Link>
          <Link to={clientId ? `${createPageUrl("HomeworkBuilder")}?patientId=${clientId}` : createPageUrl("HomeworkBuilder")}>
            <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <ClipboardList className="w-4 h-4" /> Assign homework
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mt-6 pt-6 border-t border-gray-100">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{f.label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}