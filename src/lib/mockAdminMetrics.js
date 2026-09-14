// Admin dashboard metrics derived from the shared mock clinic roster,
// so admin figures match the clinician and client portals.
import {
  MOCK_CLIENTS,
  MOCK_CLINICIANS,
  MOCK_ACTIVE_CLIENTS,
  MOCK_WAITLIST_CLIENTS,
  MOCK_ON_HOLD_CLIENTS,
  MOCK_AVG_COMPLIANCE,
} from "@/lib/mockClinic";

const countBy = (items, key) => {
  const counts = {};
  items.forEach((i) => {
    const k = i[key] || "other";
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const ageBand = (age) => {
  if (age <= 5) return "0–5";
  if (age <= 9) return "6–9";
  if (age <= 13) return "10–13";
  if (age <= 17) return "14–17";
  return "18+";
};

const byAgeCounts = {};
MOCK_ACTIVE_CLIENTS.forEach((c) => {
  const band = ageBand(c.age);
  byAgeCounts[band] = (byAgeCounts[band] || 0) + 1;
});

const caseloadByClinician = MOCK_CLINICIANS.map((t) => ({
  name: t.full_name,
  value: MOCK_CLIENTS.filter((c) => c.clinician_id === t.id).length,
})).filter((c) => c.value > 0);

const clinicianUtilization = MOCK_CLINICIANS.map((t) => {
  const caseload = MOCK_CLIENTS.filter((c) => c.clinician_id === t.id);
  const active = caseload.filter((c) => c.status === "active");
  const complianceAvg = active.length
    ? Math.round(active.reduce((s, c) => s + c.compliance, 0) / active.length)
    : 0;
  return {
    id: t.id,
    name: t.full_name,
    caseloadSize: caseload.length,
    activeCaseload: active.length,
    homeworkPlans: active.length * 3,
    complianceAvg,
  };
}).sort((a, b) => b.caseloadSize - a.caseloadSize);

export const MOCK_ADMIN_METRICS = {
  overview: {
    activeClients: MOCK_ACTIVE_CLIENTS.length,
    totalClients: MOCK_CLIENTS.length,
    activeClinicians: MOCK_CLINICIANS.length,
    weeklyCompliance: MOCK_AVG_COMPLIANCE,
    prevWeeklyCompliance: MOCK_AVG_COMPLIANCE - 5,
    monthlyCompliance: MOCK_AVG_COMPLIANCE - 3,
    engagementRate: 72,
    completionsThisWeek: 96,
    completionsPrevWeek: 84,
  },
  waitlist: {
    total: MOCK_WAITLIST_CLIENTS.length,
    active: 2,
    inactive: MOCK_WAITLIST_CLIENTS.length - 2,
    conversionRate: 46,
    avgWaitlistDays: 38,
    engagementRate: Math.round((2 / MOCK_WAITLIST_CLIENTS.length) * 100),
    convertedCount: 6,
  },
  outcomes: {
    goalAttainmentRate: 41,
    onTrackGoals: 14,
    flaggedGoals: 4,
    metGoals: 7,
    totalGoals: 17,
    avgTreatmentDays: 168,
    dischargeCount: 3,
    dischargeReasons: [
      { name: "Goals met", value: 2 },
      { name: "Moved away", value: 1 },
    ],
    commonTargets: countBy(MOCK_ACTIVE_CLIENTS, "clinical_category").sort((a, b) => b.value - a.value),
  },
  family: {
    activeFamilies: 7,
    inactiveFamilies: MOCK_ACTIVE_CLIENTS.length - 7,
    totalFamilies: MOCK_ACTIVE_CLIENTS.length,
    parentResponseRate: 68,
    netEngagementScore: 71,
  },
  weeklyTrend: [
    { date: "Mon", engaged: 7, completions: 18 },
    { date: "Tue", engaged: 8, completions: 21 },
    { date: "Wed", engaged: 6, completions: 14 },
    { date: "Thu", engaged: 7, completions: 17 },
    { date: "Fri", engaged: 5, completions: 12 },
    { date: "Sat", engaged: 4, completions: 9 },
    { date: "Sun", engaged: 2, completions: 5 },
  ],
  clinicianUtilization,
  caseload: {
    active: MOCK_ACTIVE_CLIENTS.length,
    onHold: MOCK_ON_HOLD_CLIENTS.length,
    discharged: 3,
    waitlist: MOCK_WAITLIST_CLIENTS.length,
    avgTenureDays: 142,
    byClinician: caseloadByClinician,
    byCategory: countBy(MOCK_ACTIVE_CLIENTS, "clinical_category"),
    byAge: Object.entries(byAgeCounts).map(([name, value]) => ({ name, value })),
  },
};