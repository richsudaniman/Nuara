import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { format, differenceInYears } from "date-fns";

import CaseloadOverview from "@/components/caseload/CaseloadOverview";
import ClientGoals from "@/components/trainer/ClientGoals";
import ClientWorkoutPlans from "@/components/trainer/ClientWorkoutPlans";
import ClientNotes from "@/components/trainer/ClientNotes";

export default function TrainerClientDetail() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const clientId = state?.clientId || searchParams.get("clientId");

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.find((u) => u.id === clientId) || null;
    },
    enabled: !!clientId,
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignment } = useQuery({
    queryKey: ["clientAssignment", clientId, user?.id],
    queryFn: async () => {
      const all = await base44.entities.TrainerClientAssignment.filter({ trainer_id: user.id, client_id: clientId, is_active: true });
      return all[0] || null;
    },
    enabled: !!clientId && !!user?.id,
  });

  if (!clientId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">No client selected</p>
      </div>
    );
  }

  const age = client?.date_of_birth
    ? differenceInYears(new Date(), new Date(client.date_of_birth))
    : client?.age || null;

  const sinceDate = assignment?.assigned_date
    ? format(new Date(assignment.assigned_date), "MMM yyyy")
    : null;

  const focusArea = client?.therapy_focus || "Articulation";
  const schedule = client?.session_schedule || "";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Top bar */}
      {clientLoading ? (
        <Skeleton className="h-12 rounded-lg" />
      ) : client ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{client.full_name || "Client"}</h1>
            <span className="text-sm text-gray-400 flex-shrink-0">
              {[age ? `Age ${age}` : null, focusArea, sinceDate ? `Since ${sinceDate}` : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
            Ask AI
          </Button>
        </div>
      ) : null}

      {/* Profile card */}
      {clientLoading ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : client ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
            {client.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{client.full_name}</h2>
            <p className="text-sm text-gray-500">
              {[
                age ? `Age ${age}` : null,
                client.diagnosis || `${focusArea} disorder`,
                schedule || null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex-shrink-0">
            Active
          </span>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold flex-shrink-0">
            Assign homework
          </Button>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5 text-center">
          <p className="text-yellow-700 font-semibold">Client not found</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto gap-0">
          {["Overview", "Goals", "Homework history", "Notes"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase().replace(" ", "-")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 data-[state=active]:shadow-none text-gray-500 font-medium text-sm px-4 py-2.5 hover:text-gray-700"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <CaseloadOverview client={client} clientId={clientId} trainerId={user?.id} />
        </TabsContent>

        <TabsContent value="goals" className="mt-5">
          <ClientGoals clientId={clientId} />
        </TabsContent>

        <TabsContent value="homework-history" className="mt-5">
          <ClientWorkoutPlans clientId={clientId} />
        </TabsContent>

        <TabsContent value="notes" className="mt-5">
          <ClientNotes clientId={clientId} trainerId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}