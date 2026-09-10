import React from "react";
import GoalMetricTrend from "@/components/progress/GoalMetricTrend";
import SubmittedWorkFeed from "@/components/progress/SubmittedWorkFeed";
import { sessionsForGoal } from "@/lib/progressReport";
import { Target } from "lucide-react";

export default function ClientGoalProgress({ goals = [], sessions = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Goal progress</h2>
        <p className="text-sm text-gray-500 mt-0.5">Each goal with its metric trend and the work behind it</p>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <Target className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">No active goals</p>
          <p className="text-sm text-gray-400 mt-1">Add a goal to start tracking measurable progress.</p>
        </div>
      ) : (
        goals.map((goal) => {
          const goalSessions = sessionsForGoal(goal, sessions);
          return (
            <div key={goal.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GoalMetricTrend goal={goal} sessions={goalSessions} />
              <SubmittedWorkFeed entries={goalSessions} />
            </div>
          );
        })
      )}
    </div>
  );
}