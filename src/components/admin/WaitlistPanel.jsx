import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ListChecks, ArrowRight } from "lucide-react";

function Metric({ label, value, suffix, color = "#A78BFA" }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black" style={{ color }}>{value}</span>
        {suffix && <span className="text-sm font-bold text-gray-400">{suffix}</span>}
      </div>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

export default function WaitlistPanel({ waitlist }) {
  const activePct = waitlist.total > 0 ? Math.round((waitlist.active / waitlist.total) * 100) : 0;

  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/15 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-[#7c5cd6]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Waitlist management</h3>
              <p className="text-xs text-gray-400">Families awaiting practitioner assignment</p>
            </div>
          </div>
          <Link to={createPageUrl("AdminClientAssignments")} className="text-sm font-semibold text-[#7c5cd6] flex items-center gap-1 hover:underline">
            Manage <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <Metric label="On waitlist" value={waitlist.total} color="#A78BFA" />
          <Metric label="Active" value={waitlist.active} color="#34D399" />
          <Metric label="Inactive" value={waitlist.inactive} color="#94A3B8" />
          <Metric label="Conversion" value={waitlist.conversionRate} suffix="%" color="#60A5FA" />
          <Metric label="Avg wait" value={waitlist.avgWaitlistDays} suffix="d" color="#FBBF24" />
          <Metric label="Converted" value={waitlist.convertedCount} color="#34D399" />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-600">Waitlist engagement</span>
            <span className="font-bold text-[#7c5cd6]">{waitlist.engagementRate}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#A78BFA] to-[#7c5cd6]" style={{ width: `${activePct}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Pre-treatment practice activity among waitlisted families</p>
        </div>
      </CardContent>
    </Card>
  );
}