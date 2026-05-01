import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RECENT_SESSIONS = [
  { date: "May 1", value: "" },
  { date: "Apr 29", value: "78" },
  { date: "Apr 27", value: "76" },
];

export default function SessionDataLog({ metric = "/r/ accuracy" }) {
  const [entries, setEntries] = useState(RECENT_SESSIONS);

  const updateEntry = (idx, val) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, value: val } : e)));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Session data log
      </h3>
      <p className="text-xs text-gray-400 mb-4">Enter accuracy after each session</p>

      <div className="space-y-2.5 mb-4">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-sm text-gray-700 w-14">{entry.date}</span>
            <Input
              value={entry.value}
              onChange={(e) => updateEntry(i, e.target.value)}
              placeholder="%"
              className="h-9 text-sm w-20"
            />
            <span className="text-xs text-gray-400 flex-1">{metric} %</span>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full border-gray-200 text-sm font-medium">
        Save session data
      </Button>
    </div>
  );
}