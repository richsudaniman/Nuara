import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Stethoscope, Activity, TrendingUp, UserPlus, Megaphone, ListChecks, GraduationCap, ChevronRight, Settings } from "lucide-react";
import StatTile from "@/components/admin/StatTile";
import ComplianceTrendCard from "@/components/admin/ComplianceTrendCard";
import ClinicianUtilizationTable from "@/components/admin/ClinicianUtilizationTable";
import CaseloadDistribution from "@/components/admin/CaseloadDistribution";
import CaseloadStatusBar from "@/components/admin/CaseloadStatusBar";
import WaitlistPanel from "@/components/admin/WaitlistPanel";
import OutcomesPanel from "@/components/admin/OutcomesPanel";
import FamilyEngagementPanel from "@/components/admin/FamilyEngagementPanel";

const QUICK_ACTIONS = [
  { label: "Invite user", desc: "Add clinicians or staff", icon: UserPlus, page: "AdminInviteUser", color: "#A78BFA" },
  { label: "Waitlist", desc: "Manage waitlisted families", icon: ListChecks, page: "AdminClientAssignments", color: "#60A5FA" },
  { label: "Announce", desc: "Send practice alerts", icon: Megaphone, page: "AdminAnnouncements", color: "#34D399" },
  { label: "Education", desc: "Manage learning materials", icon: GraduationCap, page: "AdminEducationalContent", color: "#FBBF24" },
  { label: "Settings", desc: "Practice configuration", icon: Settings, page: "AdminSettings", color: "#F472B6" },
];

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

  if (isLoading || !data) {
    return (
      <div className="w-full max-w-[1500px] mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { overview, weeklyTrend, clinicianUtilization, caseload, waitlist, outcomes, family } = data;
  const complianceTrend = overview.weeklyCompliance - overview.prevWeeklyCompliance;
  const completionsTrend = overview.completionsPrevWeek > 0
    ? Math.round(((overview.completionsThisWeek - overview.completionsPrevWeek) / overview.completionsPrevWeek) * 100)
    : null;

  return (
    <div className="w-full max-w-[1500px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice overview</h1>
          <p className="text-sm text-gray-500 mt-1">Practice-wide engagement, clinician utilization, and caseload health</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className="px-3 py-1.5 bg-[#A78BFA]/10 text-[#7c5cd6] rounded-full">{overview.activeClinicians} clinicians</span>
          <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full">{overview.activeClients} active clients</span>
        </div>
      </div>

      {/* Section 1: Practice-wide overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile label="Active clients" value={overview.activeClients} icon={Users} accent="#34D399" hint={`${overview.totalClients} total`} />
        <StatTile label="Active clinicians" value={overview.activeClinicians} icon={Stethoscope} accent="#A78BFA" />
        <StatTile label="Weekly compliance" value={overview.weeklyCompliance} suffix="%" icon={Activity} accent="#60A5FA" trend={complianceTrend} />
        <StatTile label="Engagement rate" value={overview.engagementRate} suffix="%" icon={TrendingUp} accent="#FBBF24" hint="activities completed" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile label="Monthly compliance" value={overview.monthlyCompliance} suffix="%" accent="#60A5FA" />
        <StatTile label="Completions this week" value={overview.completionsThisWeek} accent="#34D399" trend={completionsTrend} />
        <StatTile label="On waitlist" value={caseload.waitlist} accent="#A78BFA" hint="awaiting assignment" />
        <StatTile label="Avg tenure" value={caseload.avgTenureDays >= 30 ? Math.round(caseload.avgTenureDays / 30) : caseload.avgTenureDays} suffix={caseload.avgTenureDays >= 30 ? "mo" : "days"} accent="#F472B6" />
      </div>

      {/* Compliance trend */}
      <ComplianceTrendCard data={weeklyTrend} />

      {/* Section 2: Clinician utilization */}
      <ClinicianUtilizationTable clinicians={clinicianUtilization} />

      {/* Section 3: Caseload distribution */}
      <div className="space-y-5">
        <CaseloadStatusBar caseload={caseload} />
        <CaseloadDistribution byClinician={caseload.byClinician} byCategory={caseload.byCategory} byAge={caseload.byAge} />
      </div>

      {/* Section 4 & 6: Waitlist + Family engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WaitlistPanel waitlist={waitlist} />
        <FamilyEngagementPanel family={family} />
      </div>

      {/* Section 5: Outcomes & clinical reporting */}
      <OutcomesPanel outcomes={outcomes} />

      {/* Quick actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={createPageUrl(a.page)}>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer h-full group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${a.color}1A` }}>
                      <Icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <h4 className="font-bold text-gray-900 mt-3">{a.label}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}