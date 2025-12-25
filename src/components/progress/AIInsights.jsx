import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Zap, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIInsights({ 
  workoutLogs, 
  calorieLogs, 
  metrics, 
  goals,
  user 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Prepare data summary for AI
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Recent workout data
      const recentWorkouts = workoutLogs.filter(log => 
        new Date(log.completed_date) >= sevenDaysAgo
      );
      const monthlyWorkouts = workoutLogs.filter(log => 
        new Date(log.completed_date) >= thirtyDaysAgo
      );

      // Recent nutrition data
      const recentNutrition = calorieLogs.filter(log => 
        new Date(log.date) >= sevenDaysAgo
      );
      const weeklyAvgCalories = recentNutrition.length > 0
        ? Math.round(recentNutrition.reduce((sum, log) => sum + log.calories, 0) / recentNutrition.length)
        : 0;

      // Weight trends
      const weightMetrics = metrics
        .filter(m => m.metric_type === 'weight')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Active goals summary
      const goalsSummary = goals.map(g => ({
        title: g.goal_title,
        current: g.current_value,
        target: g.target_value,
        progress: g.progress_percentage,
        deadline: g.target_date
      }));

      const prompt = `You are a fitness AI coach analyzing a client's progress data. Provide actionable, motivating insights.

CLIENT DATA (Last 7-30 Days):
- Workouts this week: ${recentWorkouts.length} (${monthlyWorkouts.length} in 30 days)
- Nutrition logs this week: ${recentNutrition.length} days logged
- Average daily calories: ${weeklyAvgCalories} cal (target: ${user?.daily_calorie_target || 2200})
- Weight trend: ${weightMetrics.length >= 2 ? `${weightMetrics[0].value} lbs → ${weightMetrics[weightMetrics.length - 1].value} lbs` : 'Not enough data'}
- Active goals: ${goalsSummary.length > 0 ? goalsSummary.map(g => `${g.title} (${g.progress}%)`).join(', ') : 'None set'}

Provide a concise analysis with:
1. Weekly Progress Summary (2-3 sentences about overall performance)
2. Key Trends (2-3 bullet points about workout/nutrition patterns)
3. Personalized Recommendations (2-3 specific, actionable tips)
4. Motivation & Next Steps (encouraging message with concrete next actions)

Keep it motivating, specific, and actionable. Use the client's actual data in your insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            weekly_summary: { type: "string" },
            trends: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            motivation: { type: "string" }
          }
        }
      });

      setInsights(response);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Unable to generate insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black italic text-[#1a1a1a]">AI INSIGHTS</h3>
              <p className="text-xs text-gray-600">Powered by AI analysis</p>
            </div>
          </div>
          {insights && (
            <Button
              onClick={generateInsights}
              disabled={isGenerating}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {!insights && !isGenerating && (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Get personalized insights about your progress, trends, and recommendations based on your data
            </p>
            <Button
              onClick={generateInsights}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold italic"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-3">
            <Skeleton className="h-20 bg-purple-200/50" />
            <Skeleton className="h-32 bg-purple-200/50" />
            <Skeleton className="h-32 bg-purple-200/50" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {insights && !isGenerating && (
          <div className="space-y-4">
            {/* Weekly Summary */}
            <div className="bg-white/80 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="font-black italic text-[#1a1a1a]">WEEKLY SUMMARY</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{insights.weekly_summary}</p>
            </div>

            {/* Key Trends */}
            {insights.trends && insights.trends.length > 0 && (
              <div className="bg-white/80 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h4 className="font-black italic text-[#1a1a1a]">KEY TRENDS</h4>
                </div>
                <ul className="space-y-2">
                  {insights.trends.map((trend, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="bg-white/80 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="font-black italic text-[#1a1a1a]">RECOMMENDATIONS</h4>
                </div>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Motivation */}
            {insights.motivation && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
                <p className="text-white text-sm font-semibold leading-relaxed italic">
                  💪 {insights.motivation}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}