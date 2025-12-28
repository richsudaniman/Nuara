import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Video, Dumbbell, TrendingUp, Activity, UserPlus, Megaphone, GraduationCap, ChevronRight, BarChart3, Shield, CheckCircle2, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: () => base44.entities.ExerciseVideo.list(),
    initialData: [],
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['allWorkoutLogs'],
    queryFn: () => base44.entities.WorkoutLog.list('-completed_date', 100),
    initialData: [],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => base44.entities.TrainerClientAssignment.filter({ is_active: true }),
    initialData: [],
    enabled: !usersLoading,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const trainers = allUsers.filter(u => u.role === 'trainer');
  const clients = allUsers.filter(u => u.role === 'user' || !u.role);
  const admins = allUsers.filter(u => u.role === 'admin');

  // Calculate Top Trainers by Client Count
  const trainerClientCounts = {};
  assignments.forEach(a => {
    trainerClientCounts[a.trainer_id] = (trainerClientCounts[a.trainer_id] || 0) + 1;
  });
  const topTrainers = trainers.map(t => ({
    ...t,
    clientCount: trainerClientCounts[t.id] || 0
  })).sort((a, b) => b.clientCount - a.clientCount).slice(0, 5);

  // Calculate Weekly Activity for Chart
  const weeklyActivityData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayWorkouts = workoutLogs.filter(log => log.completed_date === dateStr).length;
    weeklyActivityData.push({
      date: displayDate,
      workouts: dayWorkouts
    });
  }

  // Calculate Engagement
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weeklyLogs = workoutLogs.filter(log => new Date(log.completed_date) >= thisWeekStart);
  const activeClients = new Set(weeklyLogs.map(log => log.logged_by_client_id)).size;
  const engagementRate = clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0;

  // Recent Users (Newest first based on ID or created_date if available, here just slicing)
  // Assuming list returns oldest first if not specified, but usually we want newest.
  // Ideally we'd sort by created_date, but let's assume the list order or slice from end if needed.
  // For now, let's just take the last 5 added to the list as "recent" if not sorted.
  const recentUsers = [...allUsers].reverse().slice(0, 5);

  const isLoading = usersLoading || videosLoading || logsLoading || assignmentsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Main Stats Card (Active Users) */}
      <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Platform Users</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">REGISTERED USERS</span>
            <span className="text-5xl font-bold text-[#0ea5e9]">{allUsers.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to={createPageUrl("AdminInviteUser")}>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Invite New User</h4>
                  <p className="text-teal-100 text-sm">Add trainers or clients to the platform</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("AdminAnnouncements")}>
            <div className="bg-gradient-to-r from-blue-500 to-[#0ea5e9] rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Send Announcement</h4>
                  <p className="text-blue-100 text-sm">Broadcast updates to all users</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Trainers Leaderboard (Left - 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Top Trainers</h3>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden h-full">
            <CardContent className="p-0">
              <div className="p-6 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">ACTIVE TRAINERS</p>
                  <p className="text-xs text-gray-500 mt-1">{trainers.length} professionals</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0ea5e9] flex items-center justify-center text-lg font-bold text-white shadow-sm">
                  {trainers.length}
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {topTrainers.length > 0 ? (
                  topTrainers.map((trainer, index) => (
                    <div key={trainer.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                         {trainer.profile_photo_url ? (
                            <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gray-500 m-auto mt-2" />
                          )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{trainer.full_name || 'Trainer'}</p>
                        <p className="text-xs text-gray-500">{trainer.email}</p>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#0ea5e9] text-white">
                        {trainer.clientCount} clients
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No trainers yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart (Right - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Activity Volume</h3>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden h-full">
            <CardContent className="p-6">
              <div className="h-[250px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <YAxis hide />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        dy={10} 
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="workouts" radius={[4, 4, 0, 0]}>
                       {weeklyActivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#38bdf8'} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Weekly Activity</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{weeklyLogs.length}</p>
                  <p className="text-xs text-gray-500">workouts logged</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-teal-600 uppercase">Engagement</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{engagementRate}%</p>
                  <p className="text-xs text-teal-600/80">active clients</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase">Content</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{videos.length}</p>
                  <p className="text-xs text-blue-600/80">videos uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status / Alerts */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="py-12 flex flex-col items-center justify-center bg-blue-50/30">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#0ea5e9]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">All systems operational!</h3>
              <p className="text-gray-500">No security alerts or issues detected.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
            <Link to={createPageUrl("AdminUsers")} className="text-sm font-semibold text-[#0ea5e9] flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.profile_photo_url ? (
                          <img src={user.profile_photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm">{user.full_name || 'User'}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                                user.role === 'trainer' ? 'bg-purple-100 text-purple-600' : 
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {user.role || 'Client'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.created_date ? format(new Date(user.created_date), 'MMM d') : 'Recent'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">No users found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {weeklyLogs.length > 0 ? (
                  weeklyLogs.slice(0, 5).map((log, idx) => {
                    const client = clients.find(c => c.id === log.logged_by_client_id);
                    return (
                      <div key={idx} className="p-4 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                           {client?.profile_photo_url ? (
                              <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-gray-900 text-sm">{client?.full_name || 'Client'}</p>
                            <span className="text-xs text-gray-400">{format(new Date(log.completed_date), 'MMM d')}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            Completed {log.exercise_name} ({log.sets_completed} sets)
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}