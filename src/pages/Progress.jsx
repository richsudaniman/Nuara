import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Flame } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";

export default function Progress() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  // Mock therapy goals for demo
  const mockTherapyGoals = [
    { id: 1, goal_title: "/r/ Sound Production Accuracy", current_value: "78% accuracy", target_value: "90% accuracy", progress_percentage: 78, target_date: "2026-03-15" },
    { id: 2, goal_title: "Sentence Length & Complexity", current_value: "5.2 words avg", target_value: "7 words avg", progress_percentage: 65, target_date: "2026-04-01" },
    { id: 3, goal_title: "Speech Fluency Rate", current_value: "82% fluent", target_value: "95% fluent", progress_percentage: 82, target_date: "2026-05-01" }
  ];

  const mockArticulationData = [
    { date: 'Dec 5', value: 65 },
    { date: 'Dec 12', value: 68 },
    { date: 'Dec 19', value: 72 },
    { date: 'Dec 26', value: 75 },
    { date: 'Jan 2', value: 78 }
  ];

  const mockSentenceLengthData = [
    { date: 'Dec 5', value: 4.2 },
    { date: 'Dec 12', value: 4.5 },
    { date: 'Dec 19', value: 4.8 },
    { date: 'Dec 26', value: 5.0 },
    { date: 'Jan 2', value: 5.2 }
  ];

  const mockWeeklyPracticeData = [
    { week: 'Nov 11', sessions: 3 },
    { week: 'Nov 18', sessions: 4 },
    { week: 'Nov 25', sessions: 5 },
    { week: 'Dec 2', sessions: 5 },
    { week: 'Dec 9', sessions: 6 },
    { week: 'Dec 16', sessions: 5 },
    { week: 'Dec 23', sessions: 4 },
    { week: 'Dec 30', sessions: 5 }
  ];

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-5 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[26px] font-bold text-[#0F0F12] tracking-tight leading-tight">My Progress</h1>
        <p className="text-[14px] text-[#6B6B75]">Track your growth over time.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-[#EFEFF2] rounded-2xl p-4">
          <Target className="w-4 h-4 text-[#A78BFA] mb-2" strokeWidth={2.25} />
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em]">This week</p>
          <p className="text-[28px] font-bold text-[#0F0F12] leading-none mt-1.5">92%</p>
          <p className="text-[11px] text-[#6B6B75] mt-1">Practice completion</p>
        </div>

        <div className="bg-white border border-[#EFEFF2] rounded-2xl p-4">
          <Flame className="w-4 h-4 text-[#F97316] mb-2" strokeWidth={2.25} />
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em]">Streak</p>
          <p className="text-[28px] font-bold text-[#0F0F12] leading-none mt-1.5">7 days</p>
          <p className="text-[11px] text-[#6B6B75] mt-1">Keep it going</p>
        </div>
      </div>

      {/* Weekly Practice Chart */}
      <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">Activity</p>
        <h3 className="text-[16px] font-semibold text-[#0F0F12] mb-4">Weekly practice sessions</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockWeeklyPracticeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" vertical={false} />
            <XAxis dataKey="week" stroke="#9CA3AF" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
            <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
            <Tooltip
              cursor={{ fill: '#FAFAFB' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #EFEFF2',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="sessions" fill="#A78BFA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-[#EFEFF2] rounded-xl p-1 h-auto">
          <TabsTrigger value="goals" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white data-[state=active]:shadow-none text-[13px] font-medium rounded-lg py-2 text-[#6B6B75]">Goals</TabsTrigger>
          <TabsTrigger value="articulation" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white data-[state=active]:shadow-none text-[13px] font-medium rounded-lg py-2 text-[#6B6B75]">Sounds</TabsTrigger>
          <TabsTrigger value="language" className="data-[state=active]:bg-[#A78BFA] data-[state=active]:text-white data-[state=active]:shadow-none text-[13px] font-medium rounded-lg py-2 text-[#6B6B75]">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-2.5 mt-4">
          {mockTherapyGoals.map(goal => (
            <div key={goal.id} className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#0F0F12] leading-tight">{goal.goal_title}</h3>
                  <p className="text-[12px] text-[#6B6B75] mt-1">
                    <span className="text-[#A78BFA] font-semibold">{goal.current_value}</span>
                    <span className="text-[#9CA3AF] mx-1">→</span>
                    {goal.target_value}
                  </p>
                </div>
                <span className="text-[20px] font-bold text-[#0F0F12] flex-shrink-0">{goal.progress_percentage}%</span>
              </div>
              <div className="h-1.5 bg-[#F1F1F4] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#A78BFA] rounded-full"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9CA3AF]">Target by {format(new Date(goal.target_date), 'MMM d, yyyy')}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="articulation" className="mt-4">
          <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">Articulation</p>
            <h3 className="text-[16px] font-semibold text-[#0F0F12] mb-4">/r/ Sound Accuracy Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockArticulationData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #EFEFF2',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#A78BFA" fillOpacity={1} fill="url(#colorAccuracy)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[12px] text-[#6B6B75] mt-3">
              Up <span className="font-semibold text-[#A78BFA]">13%</span> over the past month.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="language" className="mt-4">
          <div className="bg-white border border-[#EFEFF2] rounded-2xl p-5">
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">Language</p>
            <h3 className="text-[16px] font-semibold text-[#0F0F12] mb-4">Average sentence length</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockSentenceLengthData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #EFEFF2',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#A78BFA" strokeWidth={2.5} dot={{ fill: '#A78BFA', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[12px] text-[#6B6B75] mt-3">
              Sentences are getting longer and more complex.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}