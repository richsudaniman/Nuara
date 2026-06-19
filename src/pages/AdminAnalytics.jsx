import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Dumbbell, Activity, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalytics() {
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['allWorkoutLogs'],
    queryFn: () => base44.entities.TherapyLog.list('-completed_date', 100),
    initialData: [],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => base44.entities.PractitionerPatientAssignment.filter({ is_active: true }),
    initialData: [],
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const trainers = allUsers.filter(u => u.role === 'trainer');
  const clients = allUsers.filter(u => u.role === 'user' || !u.role);
  
  // Calculate weekly activity
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = workoutLogs.filter(log => log.completed_date === dateStr).length;
    weeklyActivity.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      workouts: count
    });
  }

  // Calculate engagement
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weeklyLogs = workoutLogs.filter(log => new Date(log.completed_date) >= thisWeekStart);
  const activeClients = new Set(weeklyLogs.map(log => log.logged_by_client_id)).size;
  const engagementRate = clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0;

  // Role distribution
  const roleData = [
    { name: 'Clients', value: clients.length, color: '#0ea5e9' },
    { name: 'Trainers', value: trainers.length, color: '#8b5cf6' },
    { name: 'Admins', value: allUsers.filter(u => u.role === 'admin').length, color: '#ef4444' },
  ];

  const isLoading = usersLoading || logsLoading || assignmentsLoading;

  return (
    <div className="p-4 md:p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <Link to={createPageUrl("AdminDashboard")}>
        <Button variant="ghost" className="gap-2 text-gray-600 hover:text-[#0ea5e9]">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black italic text-[#1a1a1a]">PLATFORM ANALYTICS</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-lg bg-gray-100" />
          <Skeleton className="h-64 rounded-lg bg-gray-100" />
        </div>
      ) : (
        <>
          {/* Weekly Activity Chart */}
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Weekly Workout Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="workouts" radius={[4, 4, 0, 0]}>
                    {weeklyActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#2dd4bf'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">User Distribution</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : index === 1 ? '#2dd4bf' : '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {roleData.map((item, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: index === 0 ? '#0ea5e9' : index === 1 ? '#2dd4bf' : '#6366f1' }}></div>
                      <p className="text-xs font-semibold text-gray-600">{item.name}</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-teal-500 to-teal-600 border-none rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-5 text-white relative">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Activity className="w-12 h-12" />
                </div>
                <p className="text-xs font-bold opacity-80 uppercase tracking-wide">Engagement Rate</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-black">{engagementRate}%</p>
                </div>
                <p className="text-xs opacity-90 mt-1 font-medium bg-white/20 inline-block px-2 py-0.5 rounded-full">{activeClients} of {clients.length} active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 border-none rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-5 text-white relative">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Users className="w-12 h-12" />
                </div>
                <p className="text-xs font-bold opacity-80 uppercase tracking-wide">Avg Clients/Trainer</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-black">{trainers.length > 0 ? Math.round(assignments.length / trainers.length) : 0}</p>
                </div>
                <p className="text-xs opacity-90 mt-1 font-medium bg-white/20 inline-block px-2 py-0.5 rounded-full">{assignments.length} total assignments</p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Health */}
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-5">
              <h3 className="font-black italic text-[#1a1a1a] mb-4">PLATFORM HEALTH</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700">User Activity</span>
                    <span className="text-[#0ea5e9] font-black">{engagementRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#0284c7]"
                      style={{ width: `${engagementRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700">Trainer Utilization</span>
                    <span className="text-purple-600 font-black">
                      {trainers.length > 0 ? Math.round((assignments.length / (trainers.length * 10)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                      style={{ width: `${trainers.length > 0 ? Math.min((assignments.length / (trainers.length * 10)) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Assuming 10 clients per trainer capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}