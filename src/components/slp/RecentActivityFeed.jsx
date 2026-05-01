import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageCircle, Activity } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export default function RecentActivityFeed({ workoutLogs, clients }) {
  // Build activity entries from workout logs
  const completionMap = {};
  workoutLogs.forEach((log) => {
    const key = `${log.logged_by_client_id}_${log.completed_date}`;
    if (!completionMap[key]) {
      completionMap[key] = {
        clientId: log.logged_by_client_id,
        date: log.completed_date,
        count: 0,
      };
    }
    completionMap[key].count++;
  });

  const activities = Object.values(completionMap)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <Card className="bg-white shadow-sm border-none rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Client Activity</h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No recent activity from clients</div>
          ) : (
            activities.map((a, idx) => {
              const client = clients.find((c) => c.id === a.clientId);
              return (
                <div key={idx} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {client?.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{client?.full_name || "A client"}</span>{" "}
                      completed{" "}
                      <span className="font-semibold text-teal-600">{a.count} exercise{a.count > 1 ? "s" : ""}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.date)}</span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}