import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Target, Flame } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export default function NutritionAnalytics({ logs, dailyTarget }) {
  const [timeRange, setTimeRange] = useState('week'); // 'week' or 'month'

  // Calculate date range
  const today = new Date();
  const startDate = timeRange === 'week' 
    ? startOfWeek(today, { weekStartsOn: 1 })
    : subDays(today, 30);

  // Filter logs by date range
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= today;
  });

  // Calculate daily totals
  const dailyTotals = {};
  filteredLogs.forEach(log => {
    if (!dailyTotals[log.date]) {
      dailyTotals[log.date] = {
        date: log.date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
      };
    }
    dailyTotals[log.date].calories += log.calories || 0;
    dailyTotals[log.date].protein += log.protein || 0;
    dailyTotals[log.date].carbs += log.carbs || 0;
    dailyTotals[log.date].fats += log.fats || 0;
  });

  // Convert to array and sort
  const dailyData = Object.values(dailyTotals)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(day => ({
      ...day,
      shortDate: format(new Date(day.date), 'MM/dd')
    }));

  // Calculate averages
  const avgCalories = dailyData.length > 0 
    ? Math.round(dailyData.reduce((sum, d) => sum + d.calories, 0) / dailyData.length)
    : 0;
  const avgProtein = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, d) => sum + d.protein, 0) / dailyData.length)
    : 0;
  const avgCarbs = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, d) => sum + d.carbs, 0) / dailyData.length)
    : 0;
  const avgFats = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, d) => sum + d.fats, 0) / dailyData.length)
    : 0;

  // Macro breakdown pie chart data
  const macroData = [
    { name: 'Protein', value: avgProtein * 4, color: '#0ea5e9' },
    { name: 'Carbs', value: avgCarbs * 4, color: '#8b5cf6' },
    { name: 'Fats', value: avgFats * 9, color: '#ec4899' }
  ];

  // Days on target
  const daysOnTarget = dailyData.filter(d => 
    Math.abs(d.calories - dailyTarget) <= dailyTarget * 0.1
  ).length;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black italic text-[#1a1a1a]">ANALYTICS</h3>
              <p className="text-xs text-gray-600">Your nutrition insights</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-600 font-semibold">Avg Calories</span>
            </div>
            <p className="text-2xl font-black italic text-blue-900">{avgCalories}</p>
            <p className="text-xs text-gray-500">Target: {dailyTarget}</p>
          </div>

          <div className="bg-white p-3 rounded border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 font-semibold">On Target</span>
            </div>
            <p className="text-2xl font-black italic text-blue-900">{daysOnTarget}</p>
            <p className="text-xs text-gray-500">of {dailyData.length} days</p>
          </div>
        </div>

        {/* Daily Calorie Trend */}
        {dailyData.length > 0 && (
          <div className="bg-white p-4 rounded border-2 border-blue-200">
            <h4 className="text-sm font-black italic text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              DAILY CALORIES
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="shortDate" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#94a3b8"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #0ea5e9',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="calories" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Macro Breakdown */}
        {avgProtein + avgCarbs + avgFats > 0 && (
          <div className="bg-white p-4 rounded border-2 border-blue-200">
            <h4 className="text-sm font-black italic text-[#1a1a1a] mb-3">
              AVG MACROS BREAKDOWN
            </h4>
            <div className="flex items-center justify-between gap-4">
              <ResponsiveContainer width="50%" height={120}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#0ea5e9] rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-700">Protein</span>
                  </div>
                  <span className="text-sm font-black text-[#1a1a1a]">{avgProtein}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#8b5cf6] rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-700">Carbs</span>
                  </div>
                  <span className="text-sm font-black text-[#1a1a1a]">{avgCarbs}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ec4899] rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-700">Fats</span>
                  </div>
                  <span className="text-sm font-black text-[#1a1a1a]">{avgFats}g</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {dailyData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 font-semibold">
              No data available for this period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}