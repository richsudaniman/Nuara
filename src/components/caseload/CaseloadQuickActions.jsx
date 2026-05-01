import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight } from "lucide-react";

export default function CaseloadQuickActions({ clientId, client, trainerId }) {
  const actions = [
    { label: "Assign next week's homework", onClick: null },
    { label: "Review story retelling recording", onClick: null },
    { label: "Message parent", link: createPageUrl("TrainerMessages") },
    { label: "Draft progress note", onClick: null },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick actions</h3>
      <div className="space-y-2">
        {actions.map((action, i) => {
          const content = (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{action.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
            </div>
          );

          if (action.link) {
            return <Link key={i} to={action.link}>{content}</Link>;
          }
          return <div key={i}>{content}</div>;
        })}
      </div>
    </div>
  );
}