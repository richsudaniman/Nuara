import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, TrendingUp, ChevronRight, Flame, Target, UtensilsCrossed, UserPlus, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";

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

  const { data: allGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['allClientGoals', user?.id],
    queryFn: async () => {
      const clientIds = assignments.map(a => a.client_id);
      if (clientIds.length === 0) return [];
      return await base44.entities.FitnessGoal.filter({ is_active: true });
    },
    initialData: [],
    enabled: !!user?.id && assignments.length > 0,
  });

  const { data: allWorkoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['allClientWorkoutPlans', user?.id],
    queryFn: async () => {
      return await base44.entities.WorkoutPlan.filter({ created_by_trainer_id: user.id });
    },
    initialData: [],
    enabled: !!user?.id,
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
    const activeGoals = allGoals.filter(g => g.assigned_to_client_id === clientId);
    const workoutPlans = allWorkoutPlans.filter(p => p.assigned_to_client_id === clientId);
    const assignment = assignments.find(a => a.client_id === clientId);
    
    return {
      weeklyWorkouts: clientLogs.length,
      activeGoals: activeGoals.length,
      workoutPlans: workoutPlans.length,
      daysAssigned: assignment ? differenceInDays(new Date(), new Date(assignment.assigned_date)) : 0
    };
  };

  const isLoading = assignmentsLoading || clientsLoading || logsLoading || goalsLoading || plansLoading;

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic text-[#1a1a1a]">MY CLIENTS</h1>
            <p className="text-sm text-gray-600 italic">{assignments.length} Active</p>
          </div>
        </div>
        <Link to={createPageUrl("TrainerAssignClients")}>
          <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic">
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Client
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-2 border-gray-200 focus:border-[#0ea5e9]"
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
            const stats = getClientStats(client.id);
            return (
              <Link key={client.id} to={`${createPageUrl('TrainerClientDetail')}?clientId=${client.id}`}>
                <Card className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] hover:shadow-xl transition-all duration-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Left accent bar */}
                      <div className={`w-2 ${stats.weeklyWorkouts >= 3 ? 'bg-green-500' : stats.weeklyWorkouts > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center flex-shrink-0 shadow-lg">
                            {client.profile_photo_url ? (
                              <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-white font-black italic text-2xl">
                                {client.full_name?.charAt(0) || 'C'}
                              </span>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-black italic text-[#1a1a1a] text-lg">{client.full_name || 'Client'}</h3>
                            <p className="text-sm text-gray-500">{client.email}</p>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded">
                                <Flame className="w-3.5 h-3.5 text-orange-600" />
                                <span className="text-xs font-bold text-orange-900">{stats.weeklyWorkouts} workouts</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded">
                                <Target className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-xs font-bold text-purple-900">{stats.activeGoals} goals</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded">
                                <UtensilsCrossed className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-bold text-blue-900">{stats.workoutPlans} plans</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded">
                                <Calendar className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-bold text-green-900">{stats.daysAssigned}d client</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center px-3">
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-black italic text-gray-700 text-xl mb-2">
              {searchQuery ? "No Clients Found" : "No Clients Yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? "Try adjusting your search terms" : "Start building your roster by assigning clients"}
            </p>
            {!searchQuery && (
              <Link to={createPageUrl("TrainerAssignClients")}>
                <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Your First Client
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}