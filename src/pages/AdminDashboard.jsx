import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Legend, Cell, PieChart, Pie, Sector 
} from "recharts";
import WaitlistPanel from "@/components/admin/WaitlistPanel";
import OutcomesPanel from "@/components/admin/OutcomesPanel";
import FamilyEngagementPanel from "@/components/admin/FamilyEngagementPanel";

const COLORS = {
  primary: "#14b8a6", // teal-500
  secondary: "#10b981", // emerald-500
  accent: "#8b5cf6", // purple-500
  muted: "#94a3b8", // slate-400
  background: "#f8fafc",
  orange: "#f97316",
  pink: "#ec4899",
  blue: "#3b82f6"
};

const CHART_PALETTE = [COLORS.primary, COLORS.accent, COLORS.secondary, COLORS.orange, COLORS.pink, COLORS.blue];

function StatCard({ title, value, subValue, trend, trendLabel }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        {subValue && <span className="text-sm font-semibold text-gray-400">{subValue}</span>}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-2 flex items-center gap-1.5">
          {trend !== undefined && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? "bg-emerald-100 text-emerald-700" : trend < 0 ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
          {trendLabel && <span className="text-[11px] text-gray-400 font-medium">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboardMetrics"],
    queryFn: async () => {
      const res = await base44.functions.invoke("adminDashboardMetrics", {});
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isLoading || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const { overview, weeklyTrend, clinicianUtilization, caseload, waitlist, outcomes, family } = data;
  
  const complianceTrend = overview.weeklyCompliance - overview.prevWeeklyCompliance;

  // Process data for charts
  const ageData = caseload.byAge.filter(d => d.value > 0).sort((a,b) => b.value - a.value);
  const categoryData = caseload.byCategory.filter(d => d.value > 0).sort((a,b) => b.value - a.value);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-bold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header matching Practitioner dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Administrator
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Practice-wide engagement, utilization, and caseload health
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Clients" 
          value={overview.activeClients} 
          subValue={`/ ${overview.totalClients}`}
          trendLabel={`${caseload.waitlist} on waitlist`}
        />
        <StatCard 
          title="Avg Compliance" 
          value={`${overview.weeklyCompliance}%`} 
          trend={complianceTrend}
          trendLabel="vs last week"
        />
        <StatCard 
          title="Clinicians" 
          value={overview.activeClinicians}
          trendLabel={`Avg caseload: ${Math.round(overview.activeClients / Math.max(1, overview.activeClinicians))}`}
        />
        <StatCard 
          title="Goal Attainment" 
          value={`${outcomes.goalAttainmentRate}%`}
          trendLabel={`${outcomes.metGoals} goals met`}
        />
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Engagement Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Weekly Engagement Trend</h3>
              <p className="text-[11px] text-gray-400 mt-1">Active clients engaged vs activities completed</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-gray-900">{overview.completionsThisWeek}</span>
              <p className="text-[11px] text-teal-600 font-bold uppercase">Completions</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEngaged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="completions" name="Activities Completed" fill={COLORS.accent} radius={[4, 4, 0, 0]} barSize={20} />
                <Area yAxisId="right" type="monotone" dataKey="engaged" name="Clients Engaged" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorEngaged)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinician Utilization */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Clinician Utilization</h3>
              <p className="text-[11px] text-gray-400 mt-1">Caseload size and compliance per clinician</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={clinicianUtilization.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" xAxisId="bottom" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <XAxis type="number" xAxisId="top" orientation="top" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar xAxisId="bottom" dataKey="caseloadSize" name="Caseload" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={16} />
                <Bar xAxisId="top" dataKey="complianceAvg" name="Compliance %" fill={COLORS.muted} fillOpacity={0.3} radius={[0, 4, 4, 0]} barSize={8} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Charts Row 2: Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Caseload by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Caseload by Category</h3>
          <p className="text-[11px] text-gray-400 mb-6">Distribution across clinical focus areas</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} dy={8} tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Clients" radius={[6, 6, 0, 0]} barSize={32}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Caseload by Age (Donut) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Age Distribution</h3>
          <p className="text-[11px] text-gray-400 mb-2">Active clients grouped by age</p>
          <div className="flex-1 min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text for donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[80px]">
              <span className="text-2xl font-black text-gray-900">{overview.activeClients}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Panels from original layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaitlistPanel waitlist={waitlist} />
        <FamilyEngagementPanel family={family} />
      </div>
      <OutcomesPanel outcomes={outcomes} />

    </div>
  );
}