import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PALETTE = ["#A78BFA", "#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#22D3EE", "#FB923C", "#A3A3A3"];

function MiniBar({ title, subtitle, data }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5 mb-4">{subtitle}</p>
        {hasData ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12 }}
                  width={84}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.15)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-gray-300">No data yet</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CaseloadDistribution({ byClinician, byCategory, byAge }) {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <MiniBar title="By clinician" subtitle="Active assignments per clinician" data={byClinician} />
      <MiniBar
        title="By clinical category"
        subtitle="Primary focus across active clients"
        data={byCategory.map((d) => ({ ...d, name: cap(d.name) }))}
      />
      <MiniBar title="By age band" subtitle="Active clients grouped by age" data={byAge} />
    </div>
  );
}