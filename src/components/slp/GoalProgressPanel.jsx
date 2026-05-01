import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { format } from "date-fns";

const GOAL_COLORS = {
  articulation_accuracy: { bar: "from-purple-500 to-pink-500", bg: "bg-purple-50", text: "text-purple-700" },
  sentence_length: { bar: "from-blue-500 to-teal-500", bg: "bg-blue-50", text: "text-blue-700" },
  fluency_rate: { bar: "from-teal-500 to-emerald-500", bg: "bg-teal-50", text: "text-teal-700" },
};

const mockGoals = [
  { id: 1, goal_title: "/r/ Sound Accuracy", current_value: "78% accuracy", target_value: "90%", progress_percentage: 78, target_date: "2026-03-15", linked_metric_type: "articulation_accuracy", patient_name: "Sarah M." },
  { id: 2, goal_title: "Sentence Complexity", current_value: "5.2 words avg", target_value: "7 words", progress_percentage: 65, target_date: "2026-04-01", linked_metric_type: "sentence_length", patient_name: "James T." },
  { id: 3, goal_title: "Speech Fluency", current_value: "82% fluent", target_value: "95%", progress_percentage: 82, target_date: "2026-05-01", linked_metric_type: "fluency_rate", patient_name: "Sarah M." },
  { id: 4, goal_title: "/s/ Sound Accuracy", current_value: "61% accuracy", target_value: "85%", progress_percentage: 61, target_date: "2026-04-15", linked_metric_type: "articulation_accuracy", patient_name: "Lucas P." },
];

export default function GoalProgressPanel({ goals = [] }) {
  const displayGoals = goals.length > 0 ? goals : mockGoals;

  return (
    <Card className="bg-white shadow-sm border-none rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500" />
          <h3 className="font-bold text-gray-900">Active Therapy Goals</h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {displayGoals.map((goal) => {
            const colors = GOAL_COLORS[goal.linked_metric_type] || GOAL_COLORS.articulation_accuracy;
            return (
              <div key={goal.id} className="px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{goal.goal_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {goal.patient_name && <span className="font-medium text-gray-600">{goal.patient_name} · </span>}
                      {goal.current_value} → {goal.target_value}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.bg} ${colors.text} flex-shrink-0 ml-2`}>
                    {goal.progress_percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all`}
                    style={{ width: `${goal.progress_percentage}%` }}
                  />
                </div>
                {goal.target_date && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Target: {format(new Date(goal.target_date), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}