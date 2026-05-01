import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getBarColor(pct) {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 50) return "bg-yellow-500";
  if (pct >= 25) return "bg-orange-400";
  return "bg-gray-300";
}

export default function CaseloadComplianceList({ clients, totalCount }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Caseload Compliance This Week</h3>
      {clients.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No clients to show</p>
      ) : (
        <div className="space-y-5">
          {clients.map((c, idx) => {
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <div key={c.id || idx} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorClass}`}>
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.focusArea}</p>
                </div>
                <div className="w-20 flex items-center gap-2 flex-shrink-0">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getBarColor(c.compliance)}`} style={{ width: `${c.compliance}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right flex-shrink-0">{c.compliance}%</span>
              </div>
            );
          })}
        </div>
      )}
      {totalCount > clients.length && (
        <Link to={createPageUrl("TrainerClients")}>
          <button className="w-full mt-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            View all {totalCount} clients
          </button>
        </Link>
      )}
    </div>
  );
}