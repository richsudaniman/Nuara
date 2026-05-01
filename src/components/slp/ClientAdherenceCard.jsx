import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, User, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientAdherenceCard({ clients, assignments, workoutLogs }) {
  const getAdherenceScore = (clientId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const logs = workoutLogs.filter(
      (l) => l.logged_by_client_id === clientId && new Date(l.completed_date) >= sevenDaysAgo
    );
    const uniqueDays = new Set(logs.map((l) => l.completed_date)).size;
    return Math.min(Math.round((uniqueDays / 5) * 100), 100);
  };

  const clientsWithScores = clients
    .map((c) => ({ client: c, score: getAdherenceScore(c.id) }))
    .sort((a, b) => b.score - a.score);

  return (
    <Card className="bg-white shadow-sm border-none rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Client Adherence</h3>
          <Link to={createPageUrl("TrainerClients")} className="text-xs font-semibold text-teal-600 flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {clientsWithScores.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No active clients yet</div>
          ) : (
            clientsWithScores.map(({ client, score }) => (
              <Link key={client.id} to={`${createPageUrl("TrainerClientDetail")}?clientId=${client.id}`}>
                <div className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {client.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{client.full_name}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                      <div
                        className={`h-full rounded-full transition-all ${
                          score >= 75 ? "bg-emerald-500" : score >= 40 ? "bg-yellow-400" : "bg-red-400"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    score >= 75 ? "bg-emerald-100 text-emerald-700" :
                    score >= 40 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {score}%
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}