import React from "react";

const stats = [
  { id: "clients", label: "Active clients", subLabel: null, changeLabel: null },
  { id: "compliance", label: "Avg. compliance", subLabel: null, changeLabel: null },
  { id: "recordings", label: "Pending\nrecordings", subLabel: null },
  { id: "plans", label: "Plans expiring", subLabel: null },
];

export default function DashboardStatCards({ data }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Active clients */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-3xl font-bold text-gray-900">{data.activeClients}</p>
        <p className="text-xs text-gray-500 mt-1">Active clients</p>
        {data.onHold > 0 && <p className="text-[11px] text-gray-400 mt-0.5">{data.onHold} on hold</p>}
      </div>

      {/* Avg compliance */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-3xl font-bold text-gray-900">{data.avgCompliance}%</p>
        <p className="text-xs text-gray-500 mt-1">Avg. compliance</p>
        {data.complianceChange !== 0 && (
          <p className={`text-[11px] mt-0.5 ${data.complianceChange < 0 ? "text-red-500" : "text-emerald-500"}`}>
            {data.complianceChange < 0 ? "↓" : "↑"} {Math.abs(data.complianceChange)}% vs last week
          </p>
        )}
      </div>

      {/* Pending recordings */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-3xl font-bold text-gray-900">{data.pendingRecordings}</p>
        <p className="text-xs text-gray-500 mt-1">Pending recordings</p>
        {data.pendingRecordings > 0 && <p className="text-[11px] text-gray-400 mt-0.5">unreviewed</p>}
      </div>

      {/* Plans expiring */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-3xl font-bold text-gray-900">{data.plansExpiring}</p>
        <p className="text-xs text-gray-500 mt-1">Plans expiring</p>
        {data.plansExpiring > 0 && <p className="text-[11px] text-gray-400 mt-0.5">by Sunday</p>}
      </div>
    </div>
  );
}