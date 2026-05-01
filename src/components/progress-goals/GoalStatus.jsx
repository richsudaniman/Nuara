import React from "react";
import { Button } from "@/components/ui/button";

const STATUS_STYLES = {
  "On track": "bg-emerald-100 text-emerald-700",
  Monitor: "bg-yellow-100 text-yellow-700",
  Behind: "bg-red-100 text-red-700",
};

export default function GoalStatus({ goals }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Goal status
      </h3>
      <div className="space-y-3 mb-5">
        {goals.map((goal, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-800 flex-1">{goal.name}</p>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                STATUS_STYLES[goal.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {goal.status}
            </span>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full border-gray-200 text-sm font-medium">
        Draft progress note ↗
      </Button>
    </div>
  );
}