import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Video, Dumbbell, TrendingUp, Activity, UserPlus, Megaphone, GraduationCap, ChevronRight, BarChart3, Shield, CheckCircle2, User } from "lucide-react";
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

  const { data: workoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['allWorkoutPlans'],
    queryFn: () => base44.entities.WorkoutPlan.list(),
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

  const trainers = allUsers.filter(u => u.role === 'trainer');
  const clients = allUsers.filter(u => u.role === 'user' || !u.role);

  // Calculate Engagement
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weeklyLogs = workoutLogs.filter(log => new Date(log.completed_date) >= thisWeekStart);
  const activeClients = new Set(weeklyLogs.map(log => log.logged_by_client_id)).size;
  const engagementRate = clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: allUsers.length,
      color: "text-[#0ea5e9]",
      bgColor: "bg-[#0ea5e9]/10",
      link: createPageUrl("AdminUsers")
    },
    {
      icon: Award,
      label: "Trainers",
      value: trainers.length,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: createPageUrl("AdminTrainers")
    },
    {
      icon: Users,
      label: "Clients",
      value: clients.length,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: createPageUrl("AdminUsers")
    },
    {
      icon: Video,
      label: "Exercise Videos",
      value: videos.length,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: createPageUrl("AdminVideos")
    },
    {
      icon: Dumbbell,
      label: "Workout Plans",
      value: workoutPlans.length,
      color: "text-red-600",
      bgColor: "bg-red-100",
      link: createPageUrl("AdminAnalytics") // Or generic analytics if plans page doesn't exist
    },
    {
      icon: Activity,
      label: "Weekly Activity",
      value: weeklyLogs.length,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      link: createPageUrl("AdminAnalytics")
    },
  ];

  const isLoading = usersLoading || videosLoading || plansLoading || logsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and management</p>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer h-full rounded-xl overflow-hidden group">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-[#1a1a1a]">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Engagement Card */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-none shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-bold opacity-90 uppercase">Overall Engagement Rate</p>
              <p className="text-4xl font-black italic mt-1">{engagementRate}%</p>
              <p className="text-sm opacity-80 mt-1">{activeClients} of {clients.length} clients active this week</p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={createPageUrl("AdminInviteUser")}>
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Invite User</h4>
                  <p className="text-teal-100 text-xs">Add new users or trainers</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("AdminAnnouncements")}>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Announce</h4>
                  <p className="text-purple-100 text-xs">Send platform alerts</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("AdminEducationalContent")}>
             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Education</h4>
                  <p className="text-blue-100 text-xs">Manage learning materials</p>
                </div>
              </div>
            </div>
          </Link>

           <Link to={createPageUrl("AdminVideos")}>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Videos</h4>
                  <p className="text-orange-100 text-xs">Manage video library</p>
                </div>
              </div>
            </div>
          </Link>
          
           <Link to={createPageUrl("AdminClientAssignments")}>
             <div className="bg-white border-none shadow-sm rounded-xl p-6 hover:shadow-md transition-all cursor-pointer h-full flex items-center gap-4 group">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Assignments</h4>
                  <p className="text-gray-500 text-xs">Manage client pairs</p>
                </div>
            </div>
          </Link>

           <Link to={createPageUrl("AdminUsers")}>
             <div className="bg-white border-none shadow-sm rounded-xl p-6 hover:shadow-md transition-all cursor-pointer h-full flex items-center gap-4 group">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">All Users</h4>
                  <p className="text-gray-500 text-xs">Manage accounts</p>
                </div>
            </div>
          </Link>

           <Link to={createPageUrl("AdminTrainers")}>
             <div className="bg-white border-none shadow-sm rounded-xl p-6 hover:shadow-md transition-all cursor-pointer h-full flex items-center gap-4 group">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Trainers</h4>
                  <p className="text-gray-500 text-xs">Access control</p>
                </div>
            </div>
          </Link>

          <Link to={createPageUrl("AdminAnalytics")}>
             <div className="bg-white border-none shadow-sm rounded-xl p-6 hover:shadow-md transition-all cursor-pointer h-full flex items-center gap-4 group">
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Analytics</h4>
                  <p className="text-gray-500 text-xs">View reports</p>
                </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <Link to={createPageUrl("AdminAnalytics")} className="text-sm font-semibold text-[#0ea5e9] flex items-center hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {weeklyLogs.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {weeklyLogs.slice(0, 10).map((log, idx) => {
                  const client = clients.find(c => c.id === log.logged_by_client_id);
                  return (
                    <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                         {client?.profile_photo_url ? (
                            <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <User className="w-5 h-5 text-gray-500" />
                          )}
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
  );
}