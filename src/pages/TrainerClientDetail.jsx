import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useLocation } from "react-router-dom";
import { format, differenceInYears } from "date-fns";

import AddClientDialog from "@/components/caseload/AddClientDialog";
import ClientInfoHeader from "@/components/client-detail/ClientInfoHeader";
import ClientPracticeFrequency from "@/components/client-detail/ClientPracticeFrequency";
import ClientPracticeTrend from "@/components/client-detail/ClientPracticeTrend";
import ClientPracticeHabits from "@/components/client-detail/ClientPracticeHabits";
import ClientStatsGrid from "@/components/client-detail/ClientStatsGrid";
import ClientMetricChart from "@/components/client-detail/ClientMetricChart";
import ClientGoalProgress from "@/components/client-detail/ClientGoalProgress";
import SubmittedWorkFeed from "@/components/progress/SubmittedWorkFeed";
import ClientNotes from "@/components/trainer/ClientNotes";
import { downloadReportPdf } from "@/lib/progressReport";
import { DEMO_CLIENT, DEMO_GOALS, DEMO_SESSIONS } from "@/lib/demoClientData";

export default function TrainerClientDetail() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const clientId = state?.clientId || searchParams.get("clientId");
  const [showEdit, setShowEdit] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.find((u) => u.id === clientId) || null;
    },
    enabled: !!clientId,
  });

  const { data: assignment } = useQuery({
    queryKey: ["clientAssignment", clientId, user?.id],
    queryFn: async () => {
      const all = await base44.entities.PractitionerPatientAssignment.filter({
        trainer_id: user.id,
        client_id: clientId,
        is_active: true,
      });
      return all[0] || null;
    },
    enabled: !!clientId && !!user?.id,
  });

  const { data: realGoals = [] } = useQuery({
    queryKey: ["clientGoals", clientId],
    queryFn: async () => {
      const all = await base44.entities.TherapyGoal.filter({ assigned_to_client_id: clientId });
      return all.filter((g) => g.is_active !== false);
    },
    enabled: !!clientId,
  });

  const { data: realSessions = [] } = useQuery({
    queryKey: ["clientLogs", clientId],
    queryFn: () =>
      base44.entities.TherapyLog.filter({ logged_by_client_id: clientId }, "-completed_date", 300),
    enabled: !!clientId,
  });

  // Demo fallback so the whole dashboard reads well when no client is selected
  const isDemo = !clientId || (!clientLoading && !client);
  const displayClient = client || DEMO_CLIENT;
  const goals = isDemo ? DEMO_GOALS : realGoals;
  const sessions = isDemo ? DEMO_SESSIONS : realSessions;

  const age = displayClient.date_of_birth
    ? differenceInYears(new Date(), new Date(displayClient.date_of_birth))
    : displayClient.age || null;

  const sinceDate = assignment?.assigned_date
    ? format(new Date(assignment.assigned_date), "MMM yyyy")
    : isDemo
    ? "Jan 2025"
    : null;

  const focusArea = displayClient.therapy_focus || "Articulation";
  const schedule = displayClient.session_schedule || "";

  const handleDownload = () =>
    downloadReportPdf({ clientName: displayClient.full_name, goals, sessions });

  if (clientLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {isDemo && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-purple-900">Demo client preview</p>
          <p className="text-xs text-purple-700 mt-0.5">
            Sample goals, sessions and submissions — open a real client from your caseload to see live data.
          </p>
        </div>
      )}

      {client && (
        <AddClientDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          trainerId={user?.id}
          existingClient={client}
        />
      )}

      <ClientInfoHeader
        client={displayClient}
        clientId={clientId}
        age={age}
        sinceDate={sinceDate}
        focusArea={focusArea}
        schedule={schedule}
        onEdit={() => setShowEdit(true)}
        onDownload={handleDownload}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ClientPracticeFrequency sessions={sessions} />
        <ClientPracticeTrend sessions={sessions} />
        <div className="lg:col-span-2">
          <ClientPracticeHabits sessions={sessions} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Analytics & statistics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Submission volume and measured performance</p>
        </div>
        <ClientStatsGrid sessions={sessions} goals={goals} />
        <ClientMetricChart sessions={sessions} />
      </div>

      <ClientGoalProgress goals={goals} sessions={sessions} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent activity</h2>
            <p className="text-sm text-gray-500 mt-0.5">Latest submissions across all goals</p>
          </div>
          <SubmittedWorkFeed entries={sessions} />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Clinical notes</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your private notes on this client</p>
          </div>
          <ClientNotes clientId={clientId} trainerId={user?.id} />
        </div>
      </div>
    </div>
  );
}