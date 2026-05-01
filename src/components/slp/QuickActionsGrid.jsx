import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UserPlus, Users, MessageCircle, Video, FileText, BarChart2 } from "lucide-react";

const actions = [
  { label: "My Clients", icon: Users, to: "TrainerClients", gradient: "from-teal-500 to-emerald-500", desc: "Manage & review clients" },
  { label: "Assign Client", icon: UserPlus, to: "TrainerAssignClients", gradient: "from-purple-500 to-pink-500", desc: "Add a new patient" },
  { label: "Messages", icon: MessageCircle, to: "TrainerMessages", gradient: "from-blue-500 to-indigo-500", desc: "Chat with patients" },
  { label: "Videos", icon: Video, to: "TrainerVideos", gradient: "from-orange-500 to-red-500", desc: "Exercise library" },
];

export default function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link key={a.label} to={createPageUrl(a.to)}>
            <div className={`bg-gradient-to-br ${a.gradient} rounded-2xl p-4 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-sm">{a.label}</p>
              <p className="text-white/70 text-[11px] mt-0.5">{a.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}