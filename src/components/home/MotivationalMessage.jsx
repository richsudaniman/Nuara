import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function MotivationalMessage({ message }) {
  if (!message) {
    message = "Every workout counts. Keep pushing forward!";
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-sm rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#0ea5e9]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#0ea5e9] font-bold uppercase tracking-wider mb-1">Daily Motivation</p>
            <p className="text-sm text-[#1a1a1a] font-medium italic">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}