import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function StatTile({ label, value, suffix, icon: Icon, accent = "#A78BFA", trend, hint }) {
  const hasTrend = typeof trend === "number" && !Number.isNaN(trend);
  const trendUp = hasTrend && trend > 0;
  const trendDown = hasTrend && trend < 0;

  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
              <Icon className="w-4 h-4" style={{ color: accent }} />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-3xl font-black text-gray-900">{value}</span>
          {suffix && <span className="text-sm font-bold text-gray-400">{suffix}</span>}
        </div>
        <div className="flex items-center gap-2 mt-2 min-h-[18px]">
          {hasTrend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                trendUp ? "text-green-600" : trendDown ? "text-red-500" : "text-gray-400"
              }`}
            >
              {trendUp ? <ArrowUp className="w-3 h-3" /> : trendDown ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(trend)}{suffix === "%" ? "pts" : ""}
            </span>
          )}
          {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}