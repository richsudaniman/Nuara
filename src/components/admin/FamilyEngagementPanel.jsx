import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare, Users } from "lucide-react";

function scoreColor(score) {
  if (score >= 70) return { text: "text-green-600", ring: "#34D399" };
  if (score >= 40) return { text: "text-amber-600", ring: "#FBBF24" };
  return { text: "text-red-500", ring: "#F87171" };
}

export default function FamilyEngagementPanel({ family }) {
  const activePct = family.totalFamilies > 0 ? Math.round((family.activeFamilies / family.totalFamilies) * 100) : 0;
  const sc = scoreColor(family.netEngagementScore);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (family.netEngagementScore / 100) * circumference;

  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Family engagement</h3>
            <p className="text-xs text-gray-400">Active families and parent communication</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Net engagement score ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-[110px] h-[110px] flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke={sc.ring} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${sc.text}`}>{family.netEngagementScore}</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase">Score</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Net engagement</p>
              <p className="text-xs text-gray-400 mt-0.5 max-w-[140px]">Blended index of activity, compliance & responsiveness</p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Active families</span>
              </div>
              <span className="font-black text-gray-900">{family.activeFamilies}<span className="text-gray-400 font-bold text-sm"> / {family.totalFamilies}</span></span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Inactive</span>
              </div>
              <span className="font-black text-gray-900">{family.inactiveFamilies}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7c5cd6]" />
                <span className="text-sm font-medium text-gray-700">Parent response rate</span>
              </div>
              <span className="font-black text-gray-900">{family.parentResponseRate}%</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-600">Active vs inactive families</span>
            <span className="font-bold text-green-600">{activePct}% active</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${activePct}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}