import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { subDays } from "date-fns";

export default function TrainerClients() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["trainerAssignments", user?.id],
    queryFn: () => base44.entities.PractitionerPatientAssignment.filter({ trainer_id: user.id, is_active: true }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["allWorkoutLogs", user?.id],
    queryFn: () => base44.entities.TherapyLog.list("-completed_date", 500),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const clientIds = assignments.map((a) => a.client_id);
  const clients = allUsers.filter((u) => clientIds.includes(u.id));

  const filtered = clients.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompliance = (clientId) => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const logs = workoutLogs.filter(
      (l) => l.logged_by_client_id === clientId && new Date(l.completed_date) >= sevenDaysAgo
    );
    const uniqueDays = new Set(logs.map((l) => l.completed_date)).size;
    return Math.min(Math.round((uniqueDays / 5) * 100), 100);
  };

  const getAssignment = (clientId) => assignments.find((a) => a.client_id === clientId);

  const isLoading = assignmentsLoading || usersLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Caseload</h1>
        <p className="text-sm text-gray-500 mt-0.5">{assignments.length} active clients</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search caseload..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-200 h-10 rounded-lg text-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((client) => {
            const compliance = getCompliance(client.id);
            const assignment = getAssignment(client.id);
            return (
              <Link
                key={client.id}
                to={`${createPageUrl("TrainerClientDetail")}?clientId=${client.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                  {client.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{client.full_name || "Client"}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {client.therapy_focus || "Articulation"} · Since {assignment?.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        compliance >= 75 ? "bg-emerald-500" : compliance >= 50 ? "bg-yellow-500" : "bg-orange-400"
                      }`}
                      style={{ width: `${compliance}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-8 text-right">{compliance}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">{searchQuery ? "No results" : "No clients in caseload"}</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? "Try different search terms" : "Assign clients from the Clients page"}
          </p>
        </div>
      )}
    </div>
  );
}