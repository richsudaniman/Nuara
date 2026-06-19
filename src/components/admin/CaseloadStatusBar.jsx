import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const SEGMENTS = [
  { key: "active", label: "Active", color: "#34D399" },
  { key: "onHold", label: "On hold", color: "#FBBF24" },
  { key: "waitlist", label: "Waitlist", color: "#A78BFA" },
  { key: "discharged", label: "Discharged", color: "#94A3B8" },
];

export default function CaseloadStatusBar({ caseload }) {
  const total = SEGMENTS.reduce((sum, s) => sum + (caseload[s.key] || 0), 0) || 1;
  const tenureLabel =
    caseload.avgTenureDays >= 30
      ? `${Math.round(caseload.avgTenureDays / 30)} mo`
      : `${caseload.avgTenureDays} days`;

  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Caseload status</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution across lifecycle</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-gray-900">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-black text-lg">{tenureLabel}</span>
            </div>
            <p className="text-[11px] text-gray-400">Avg tenure</p>
          </div>
        </div>

        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
          {SEGMENTS.map((s) => {
            const val = caseload[s.key] || 0;
            if (val === 0) return null;
            return <div key={s.key} style={{ width: `${(val / total) * 100}%`, backgroundColor: s.color }} />;
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SEGMENTS.map((s) => (
            <div key={s.key} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{s.label}</span>
              </div>
              <span className="text-xl font-black text-gray-900">{caseload[s.key] || 0}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}