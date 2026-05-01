import React from "react";
import CaseloadGoals from "./CaseloadGoals";
import CaseloadCompliance from "./CaseloadCompliance";
import CaseloadHomework from "./CaseloadHomework";
import CaseloadQuickActions from "./CaseloadQuickActions";

export default function CaseloadOverview({ client, clientId, trainerId, isDemo }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left column: Goals + Homework */}
      <div className="lg:col-span-2 space-y-5">
        <CaseloadGoals clientId={clientId} isDemo={isDemo} />
        <CaseloadHomework clientId={clientId} isDemo={isDemo} />
      </div>

      {/* Right column: Compliance + Quick Actions */}
      <div className="space-y-5">
        <CaseloadCompliance clientId={clientId} isDemo={isDemo} />
        <CaseloadQuickActions clientId={clientId} client={client} trainerId={trainerId} />
      </div>
    </div>
  );
}