
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Video, Dumbbell, TrendingUp, Activity, UserPlus, Megaphone, GraduationCap } from "lucide-react"; // Added Megaphone and GraduationCap icons
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: () => base44.entities.ExerciseVideo.list('-created_date'),
    initialData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: workoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['allWorkoutPlans'],
    queryFn: () => base44.entities.WorkoutPlan.list('-created_date'),
    initialData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['allWorkoutLogs'],
    queryFn: () => base44.entities.WorkoutLog.list('-completed_date', 100),
    initialData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => base44.entities.TrainerClientAssignment.filter({ is_active: true }),
    initialData: [],
    enabled: !usersLoading, // Only fetch after users are loaded
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
      link: createPageUrl("AdminAnalytics")
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

  const isLoading = usersLoading || videosLoading || plansLoading || logsLoading || assignmentsLoading;

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-20 right-5 w-16 h-16 border-2 border-[#0ea5e9]/20 rotate-12 pointer-events-none"></div>

      {/* Role Switcher Link */}
      <Link to={createPageUrl("SwitchRole")}>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold italic shadow-lg">
          🔄 Switch Role (Client / Trainer / Admin)
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a] mb-2">ADMIN DASHBOARD</h1>
        <p className="text-gray-600 italic">Manage your fitness platform</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="bg-white border border-gray-200 hover:border-[#0ea5e9] transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</p>
                  <p className="text-3xl font-black italic text-[#1a1a1a]">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Engagement Card */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-none">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-bold opacity-90 uppercase">Overall Engagement Rate</p>
              <p className="text-4xl font-black italic mt-1">{engagementRate}%</p>
              <p className="text-xs opacity-80 mt-1">{activeClients} of {clients.length} clients active this week</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">QUICK ACTIONS</h3>
          <div className="grid gap-3">
            <Link to={createPageUrl("AdminInviteUser")}>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Invite New User</p>
                    <p className="text-xs text-gray-600">Via Base44 Dashboard - Then assign roles here</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("AdminAnnouncements")}>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Send Announcement</p>
                    <p className="text-xs text-gray-600">Broadcast messages to all users or specific groups</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("AdminEducationalContent")}>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Manage Educational Content</p>
                    <p className="text-xs text-gray-600">Upload tutorials and training guides for all users</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("AdminUsers")}>
              <div className="p-4 bg-gray-50 border-l-4 border-[#0ea5e9] hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">Manage Users</p>
                <p className="text-xs text-gray-600">View, edit, and manage all users</p>
              </div>
            </Link>

            <Link to={createPageUrl("AdminTrainers")}>
              <div className="p-4 bg-gray-50 border-l-4 border-purple-500 hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">Manage Trainers</p>
                <p className="text-xs text-gray-600">View trainers and their clients</p>
              </div>
            </Link>

            <Link to={createPageUrl("AdminClientAssignments")}>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-bold italic text-[#1a1a1a]">Manage Trainer-Client Assignments</p>
                    <p className="text-xs text-gray-600">View and assign clients to trainers</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl("AdminVideos")}>
              <div className="p-4 bg-gray-50 border-l-4 border-orange-500 hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">Manage Videos</p>
                <p className="text-xs text-gray-600">View and moderate exercise videos</p>
              </div>
            </Link>

            <Link to={createPageUrl("AdminAnalytics")}>
              <div className="p-4 bg-gray-50 border-l-4 border-indigo-500 hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-bold italic text-[#1a1a1a]">View Analytics</p>
                <p className="text-xs text-gray-600">Platform statistics and reports</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">RECENT ACTIVITY</h3>
          {weeklyLogs.length > 0 ? (
            <div className="space-y-2">
              {weeklyLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50">
                  <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">{log.exercise_name}</p>
                    <p className="text-xs text-gray-500">Client ID: {log.logged_by_client_id}</p>
                  </div>
                  <p className="text-xs text-gray-400">{log.completed_date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 italic py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
