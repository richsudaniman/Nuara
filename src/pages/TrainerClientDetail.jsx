import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { Sparkles, Download, Pencil } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { createPageUrl } from "@/utils";

import AddClientDialog from "@/components/caseload/AddClientDialog";
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
      const all = await base44.entities.PractitionerPatientAssignment.filter({ trainer_id: user.id, client_id: clientId, is_active: true });
      return all[0] || null;
    },
    enabled: !!clientId && !!user?.id,
  });

  // Demo fallback so the page matches the mockup when no real client exists
  const isDemo = !clientId || (!clientLoading && !client);
  const displayClient = client || {
    full_name: "Jalal Abdelrahim",
    age: 9,
    diagnosis: "Articulation disorder · /r/ and /s/",
    therapy_focus: "Articulation",
    session_schedule: "2× / week, Tue + Fri",
  };

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

  const [showEdit, setShowEdit] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const handleDownloadReport = async () => {
    if (!clientId) return;
    setDownloading(true);
    try {
      const res = await base44.functions.invoke("generateProgressReport", { patientId: clientId }, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `progress_report_${(displayClient.full_name || "patient").replace(/[^a-z0-9]+/gi, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {client && (
        <AddClientDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          trainerId={user?.id}
          existingClient={client}
        />
      )}
      {/* Top bar */}
      {clientLoading ? (
        <Skeleton className="h-12 rounded-lg" />
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{displayClient.full_name || "Client"}</h1>
            <span className="text-sm text-gray-400 flex-shrink-0">
              {[age ? `Age ${age}` : null, focusArea, sinceDate ? `Since ${sinceDate}` : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {clientId && client && (
              <Button
                onClick={() => setShowEdit(true)}
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
            {clientId && (
              <Button
                onClick={handleDownloadReport}
                disabled={downloading}
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Preparing..." : "Download report"}
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
              <Sparkles className="w-4 h-4" />
              Ask AI ↗
            </Button>
          </div>
        </div>
      )}

      {/* Profile card */}
      {clientLoading ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
            {displayClient.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{displayClient.full_name}</h2>
            <p className="text-sm text-gray-500">
              {[
                age ? `Age ${age}` : null,
                displayClient.diagnosis || `${focusArea} disorder`,
                sinceDate ? `Since ${sinceDate}` : null,
                schedule || null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex-shrink-0">
            Active
          </span>
          {clientId ? (
            <Link to={`${createPageUrl("HomeworkBuilder")}?patientId=${clientId}`} className="flex-shrink-0">
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-800 hover:bg-gray-50 text-sm font-medium">
                Assign homework
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="border-gray-200 text-gray-800 text-sm font-medium flex-shrink-0">
              Assign homework
            </Button>
          )}
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
          <CaseloadOverview client={displayClient} clientId={clientId} trainerId={user?.id} isDemo={isDemo} />
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