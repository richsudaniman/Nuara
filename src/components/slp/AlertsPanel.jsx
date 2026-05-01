import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import NudgeDialog from "./NudgeDialog";

const ALERT_STYLES = {
  urgent: { dot: "bg-red-500", bg: "bg-red-50 border-red-100", link: "text-red-600", nudge: "text-red-700 hover:bg-red-100 border-red-200" },
  warning: { dot: "bg-orange-400", bg: "bg-orange-50 border-orange-100", link: "text-orange-600", nudge: "text-orange-700 hover:bg-orange-100 border-orange-200" },
  info: { dot: "bg-yellow-400", bg: "bg-yellow-50 border-yellow-100", link: "text-yellow-700", nudge: "text-yellow-800 hover:bg-yellow-100 border-yellow-200" },
  positive: { dot: "bg-blue-500", bg: "bg-blue-50 border-blue-100", link: "text-blue-600", nudge: "text-blue-700 hover:bg-blue-100 border-blue-200" },
};

// Extract a likely client name from the alert title (everything before " — ")
function extractClientName(title) {
  if (!title) return null;
  const idx = title.indexOf(" — ");
  if (idx === -1) return null;
  return title.slice(0, idx).trim();
}

export default function AlertsPanel({ alerts }) {
  const [nudgeFor, setNudgeFor] = useState(null);

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Alerts Requiring Action</h3>
        <p className="text-sm text-gray-400 text-center py-4">No alerts right now — great job!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Alerts Requiring Action</h3>
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
            const clientName = extractClientName(alert.title);
            const showNudge = !!clientName && (alert.type === "urgent" || alert.type === "warning");
            return (
              <div key={idx} className={`rounded-lg border p-4 ${style.bg}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {alert.linkLabel && alert.linkTo && (
                        <Link to={alert.linkTo} className={`text-xs font-semibold inline-block ${style.link}`}>
                          {alert.linkLabel}
                        </Link>
                      )}
                      {showNudge && (
                        <button
                          onClick={() => setNudgeFor(clientName)}
                          className={`text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-white/60 transition-colors ${style.nudge}`}
                        >
                          <Zap className="w-3 h-3" />
                          Nudge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NudgeDialog
        open={!!nudgeFor}
        onOpenChange={(open) => !open && setNudgeFor(null)}
        clientName={nudgeFor}
      />
    </>
  );
}