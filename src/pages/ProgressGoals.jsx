import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import SummaryStats from "@/components/progress-goals/SummaryStats";
import TrendCard from "@/components/progress-goals/TrendCard";
import SessionDataLog from "@/components/progress-goals/SessionDataLog";
import GoalStatus from "@/components/progress-goals/GoalStatus";

export default function ProgressGoals() {
  const [client, setClient] = useState("Jalal Abdelrahim");
  const [timeframe, setTimeframe] = useState("Last 4 weeks");

  const stats = [
    { value: "78%", label: "/r/ accuracy now" },
    { value: "+14%", label: "Gain in 4 weeks" },
    { value: "83%", label: "Avg. compliance" },
  ];

  const rSoundWeeks = [
    { label: "Wk 1", value: 64 },
    { label: "Wk 2", value: 70 },
    { label: "Wk 3", value: 74 },
    { label: "Wk 4", value: 78 },
  ];

  const sentenceWeeks = [
    { label: "Wk 1", value: 50 },
    { label: "Wk 2", value: 55 },
    { label: "Wk 3", value: 60 },
    { label: "Wk 4", value: 65 },
  ];

  const goals = [
    { name: "/r/ sound production", status: "On track" },
    { name: "Sentence complexity", status: "Monitor" },
    { name: "Speech fluency rate", status: "On track" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Progress & goals</h1>
          <span className="text-sm text-gray-400">Goal tracking & progress data</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="goals">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto gap-0 w-full justify-start">
          {["Goals", "Sounds", "Compliance"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase()}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 data-[state=active]:shadow-none text-gray-500 font-medium text-sm px-4 py-2.5 hover:text-gray-700"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <div className="flex items-center gap-3">
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-purple-400"
        >
          <option>Jalal Abdelrahim</option>
          <option>Priya S.</option>
          <option>Amir K.</option>
          <option>Ella C.</option>
        </select>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-purple-400"
        >
          <option>Last 4 weeks</option>
          <option>Last 8 weeks</option>
          <option>Last 12 weeks</option>
          <option>All time</option>
        </select>
        <Button variant="outline" className="border-gray-200 text-sm h-10 px-4 leading-tight">
          Export<br />report ↗
        </Button>
      </div>

      {/* Summary stats */}
      <SummaryStats stats={stats} />

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <TrendCard
            title="/r/ sound accuracy — 4 week trend"
            weeks={rSoundWeeks}
            footer="Target: 90% by Mar 14, 2026 · Projected on track at current rate"
          />
          <TrendCard title="Sentence complexity — 4 week trend" weeks={sentenceWeeks} />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <SessionDataLog />
          <GoalStatus goals={goals} />
        </div>
      </div>
    </div>
  );
}