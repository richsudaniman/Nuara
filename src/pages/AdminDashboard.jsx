import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Video, Dumbbell, TrendingUp, Activity, UserPlus, Megaphone, GraduationCap, ChevronRight, BarChart3, Settings, Shield } from "lucide-react";
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
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: () => base44.entities.ExerciseVideo.list('-created_date'),
    initialData: [],
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: workoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['allWorkoutPlans'],
    queryFn: () => base44.entities.WorkoutPlan.list('-created_date'),
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

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weeklyLogs = workoutLogs.filter(log => new Date(log.completed_date) >= thisWeekStart);

  // Calculate engagement rate
  const activeClients = new Set(weeklyLogs.map(log => log.logged_by_client_id)).size;
  const engagementRate = clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0;

  const isLoading = usersLoading || videosLoading || plansLoading || logsLoading || assignmentsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-[#0ea5e9] text-xs font-bold rounded-full uppercase">
                {admins.length} Admin{admins.length !== 1 && 's'}
            </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <Link to={createPageUrl("AdminUsers")}>
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-[#0ea5e9]" />
                </div>
                <h3 className="font-semibold text-gray-900">Total Users</h3>
                </div>
                <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0ea5e9]">{allUsers.length}</span>
                <span className="text-xs text-gray-400 font-medium">registered</span>
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* Trainers Card */}
        <Link to={createPageUrl("AdminTrainers")}>
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Trainers</h3>
                </div>
                <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600">{trainers.length}</span>
                <span className="text-xs text-gray-400 font-medium">active pros</span>
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* Engagement Card */}
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden h-full">
            <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Engagement</h3>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">{engagementRate}%</span>
                <span className="text-xs text-gray-400 font-medium">active clients</span>
            </div>
            </CardContent>
        </Card>

        {/* Content Card */}
        <Link to={createPageUrl("AdminVideos")}>
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                    <Video className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Content</h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-orange-600">{videos.length}</span>
                    <span className="text-xs text-gray-400 font-medium">videos</span>
                </div>
                </CardContent>
            </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={createPageUrl("AdminInviteUser")}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Invite User</h4>
                  <p className="text-green-100 text-xs">Add new users or trainers</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("AdminAnnouncements")}>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Announce</h4>
                  <p className="text-purple-100 text-xs">Send platform alerts</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("AdminClientAssignments")}>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Assignments</h4>
                  <p className="text-blue-100 text-xs">Manage client-trainer pairs</p>
                </div>
              </div>
            </div>
          </Link>
          
           <Link to={createPageUrl("AdminEducationalContent")}>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Education</h4>
                  <p className="text-orange-100 text-xs">Manage learning materials</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Platform Activity</h3>
                    <Link to={createPageUrl("AdminAnalytics")} className="text-sm font-semibold text-[#0ea5e9] flex items-center hover:underline">
                        View Analytics <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-0">
                        {weeklyLogs.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {weeklyLogs.slice(0, 8).map((log, idx) => {
                                    const client = clients.find(c => c.id === log.logged_by_client_id);
                                    return (
                                        <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <Dumbbell className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-gray-900 text-sm">
                                                        {client?.full_name || 'Unknown Client'}
                                                        <span className="font-normal text-gray-500"> completed </span>
                                                        {log.exercise_name}
                                                    </p>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                        {format(new Date(log.completed_date), 'MMM d')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {log.sets_completed} sets • {log.reps_completed} reps {log.weight_used ? `• ${log.weight_used}lbs` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p>No recent activity reported</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
            {/* Platform Health/Status */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">System Status</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">OPERATIONAL</span>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Database</span>
                                <span className="font-medium text-gray-900">Connected</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">File Storage</span>
                                <span className="font-medium text-gray-900">85% Free</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Last Backup</span>
                                <span className="font-medium text-gray-900">2h ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links List */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Management</h3>
                <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                             <Link to={createPageUrl("AdminUsers")}>
                                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gray-100 rounded text-gray-500 group-hover:text-[#0ea5e9] group-hover:bg-blue-50 transition-colors">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">All Users</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0ea5e9]" />
                                </div>
                            </Link>
                             <Link to={createPageUrl("AdminTrainers")}>
                                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gray-100 rounded text-gray-500 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Trainer Access</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600" />
                                </div>
                            </Link>
                             <Link to={createPageUrl("AdminAnalytics")}>
                                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gray-100 rounded text-gray-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                            <BarChart3 className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Detailed Reports</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}