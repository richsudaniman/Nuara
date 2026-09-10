import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

export default function ClientMetricChart({ sessions = [] }) {
  const data = sessions
    .filter((s) => s.metric_value != null)
    .sort((a, b) => (a.completed_date < b.completed_date ? -1 : 1))
    .slice(-12)
    .map((s) => {
      let label = s.completed_date;
      try {
        label = format(parseISO(s.completed_date), "MMM d");
      } catch {
        /* keep raw */
      }
      return { label, value: s.metric_value, name: s.exercise_name };
    });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900">Metric trend</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Measured accuracy across recent sessions</p>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No measured sessions yet.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #EFEFF2", fontSize: 12 }}
                formatter={(v) => [`${v}%`, "Accuracy"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#A78BFA"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#A78BFA" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}