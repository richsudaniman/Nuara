import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingDown, TrendingUp, Calendar, MapPin, AlertCircle } from "lucide-react";

export default function PainHistory({ painLogs = [] }) {
  if (painLogs.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-sm rounded-3xl">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No pain logs yet. Start tracking to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by date and prepare chart data
  const sortedLogs = [...painLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sortedLogs.slice(-14).map(log => ({
    date: format(new Date(log.date), 'MMM d'),
    pain: log.pain_level
  }));

  // Calculate stats
  const latestLog = sortedLogs[sortedLogs.length - 1];
  const previousLog = sortedLogs[sortedLogs.length - 2];
  const averagePain = (sortedLogs.reduce((sum, log) => sum + log.pain_level, 0) / sortedLogs.length).toFixed(1);
  const trend = previousLog ? latestLog.pain_level - previousLog.pain_level : 0;

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-gray-600 mb-1">Latest Pain</p>
            <p className="text-3xl font-black text-teal-600">{latestLog.pain_level}/10</p>
            {trend !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {trend < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-600">Improved!</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-600">Increased</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-gray-600 mb-1">Avg Pain</p>
            <p className="text-3xl font-black text-purple-600">{averagePain}/10</p>
            <p className="text-xs text-gray-500 mt-2">{sortedLogs.length} logs total</p>
          </CardContent>
        </Card>
      </div>

      {/* Pain Trend Chart */}
      <Card className="bg-white border-0 shadow-sm rounded-3xl">
        <CardContent className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Pain Level Trend (Last 14 Days)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#999" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#999" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="pain" 
                stroke="#14b8a6" 
                strokeWidth={3}
                dot={{ fill: '#14b8a6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="bg-white border-0 shadow-sm rounded-3xl">
        <CardContent className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Recent Pain Logs</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedLogs.slice(-10).reverse().map(log => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{format(new Date(log.date), 'MMM d, yyyy')}</span>
                  </div>
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full">
                    {log.pain_level}/10
                  </span>
                </div>
                
                {log.affected_areas && log.affected_areas.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {log.affected_areas.map(area => (
                        <span key={area} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {area.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {log.pain_type && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-bold">Type:</span> {log.pain_type}
                  </p>
                )}

                {log.triggers && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-bold">Triggers:</span> {log.triggers}
                  </p>
                )}

                {log.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">"{log.notes}"</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}