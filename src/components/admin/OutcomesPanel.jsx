import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Target, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OutcomesPanel({ outcomes }) {
  const [exporting, setExporting] = React.useState(false);
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const gaugeData = [{ name: "attainment", value: outcomes.goalAttainmentRate, fill: "#34D399" }];
  const onTrackTotal = outcomes.onTrackGoals + outcomes.flaggedGoals || 1;
  const onTrackPct = Math.round((outcomes.onTrackGoals / onTrackTotal) * 100);

  const handleExport = () => {
    setExporting(true);
    const rows = [
      ["Metric", "Value"],
      ["Goal attainment rate", `${outcomes.goalAttainmentRate}%`],
      ["Goals met", outcomes.metGoals],
      ["On track", outcomes.onTrackGoals],
      ["Flagged", outcomes.flaggedGoals],
      ["Total goals", outcomes.totalGoals],
      ["Avg treatment duration (days)", outcomes.avgTreatmentDays],
      ["Discharges", outcomes.dischargeCount],
      ...outcomes.commonTargets.map((t) => [`Target: ${cap(t.name)}`, t.value]),
      ...outcomes.dischargeReasons.map((r) => [`Discharge reason: ${r.name}`, r.value]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outcome-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Outcomes & clinical reporting</h3>
              <p className="text-xs text-gray-400">Goal attainment and treatment outcomes practice-wide</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goal attainment gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-[140px] w-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "#f1f5f9" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-900">{outcomes.goalAttainmentRate}%</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Attained</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">{outcomes.metGoals} of {outcomes.totalGoals} goals met</p>
          </div>

          {/* On track vs flagged + treatment */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-600">On track</span>
                <span className="font-bold text-green-600">{outcomes.onTrackGoals}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${onTrackPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-600">Flagged</span>
                <span className="font-bold text-red-500">{outcomes.flaggedGoals}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400" style={{ width: `${100 - onTrackPct}%` }} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <div className="bg-gray-50 rounded-xl p-3 flex-1">
                <span className="text-lg font-black text-gray-900">{outcomes.avgTreatmentDays >= 30 ? `${Math.round(outcomes.avgTreatmentDays / 30)}` : outcomes.avgTreatmentDays}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">{outcomes.avgTreatmentDays >= 30 ? "mo" : "d"}</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Avg treatment</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex-1">
                <span className="text-lg font-black text-gray-900">{outcomes.dischargeCount}</span>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">Discharges</p>
              </div>
            </div>
          </div>

          {/* Common targets */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Most common targets</p>
            {outcomes.commonTargets.length > 0 ? (
              <div className="space-y-2">
                {outcomes.commonTargets.map((t, i) => {
                  const max = outcomes.commonTargets[0].value || 1;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{cap(t.name)}</span>
                        <span className="font-bold text-gray-500">{t.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#A78BFA]" style={{ width: `${(t.value / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-300">No goal data yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}