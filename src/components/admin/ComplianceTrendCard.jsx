import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ComplianceTrendCard({ data }) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-gray-900">Weekly compliance trend</h3>
          <span className="text-[11px] font-semibold text-gray-400">Engaged clients / day</span>
        </div>
        <p className="text-xs text-gray-400 mb-5">Active clients completing at least one activity each day</p>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="complianceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={8} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={36} />
              <Tooltip
                cursor={{ stroke: "#A78BFA", strokeWidth: 1 }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.15)" }}
              />
              <Area type="monotone" dataKey="engaged" stroke="#A78BFA" strokeWidth={2.5} fill="url(#complianceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}