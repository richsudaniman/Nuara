import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, TrendingUp, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TrainerClients() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['trainerAssignments', user?.id],
    queryFn: () => base44.entities.TrainerClientAssignment.filter({ trainer_id: user.id, is_active: true }),
    initialData: [],
    enabled: !!user?.id,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['assignedClients', user?.id],
    queryFn: async () => {
      const clientIds = assignments.map(a => a.client_id);
      if (clientIds.length === 0) return [];
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => clientIds.includes(u.id));
    },
    initialData: [],
    enabled: !!user?.id && assignments.length > 0,
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['allWorkoutLogs', user?.id],
    queryFn: async () => {
      const clientIds = assignments.map(a => a.client_id);
      if (clientIds.length === 0) return [];
      const allLogs = await base44.entities.WorkoutLog.list('-completed_date', 200);
      return allLogs.filter(log => clientIds.includes(log.logged_by_client_id));
    },
    initialData: [],
    enabled: !!user?.id && assignments.length > 0,
  });

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return client.full_name?.toLowerCase().includes(query) || 
           client.email?.toLowerCase().includes(query);
  });

  const getClientStats = (clientId) => {
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const clientLogs = workoutLogs.filter(log => 
      log.logged_by_client_id === clientId && 
      new Date(log.completed_date) >= thisWeekStart
    );
    return clientLogs.length;
  };

  const isLoading = assignmentsLoading || clientsLoading || logsLoading;

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <Users className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a]">MY CLIENTS</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-300"
        />
      </div>

      {/* Clients List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map(client => {
            const weeklyWorkouts = getClientStats(client.id);
            return (
              <Link key={client.id} to={`${createPageUrl('TrainerClientDetail')}?clientId=${client.id}`}>
                <Card className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                        {client.profile_photo_url ? (
                          <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#0ea5e9] font-black italic text-2xl">
                            {client.full_name?.charAt(0) || 'C'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black italic text-[#1a1a1a] text-lg">{client.full_name || 'Client'}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-[#0ea5e9]" />
                            <span className="text-xs text-gray-600 font-semibold">
                              {weeklyWorkouts} workouts this week
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          {searchQuery ? "No clients found matching your search" : "No clients assigned yet"}
        </div>
      )}
    </div>
  );
}