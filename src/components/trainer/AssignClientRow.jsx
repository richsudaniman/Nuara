import React from "react";
import { UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssignClientRow({ client, isAssignedToOther, onAssign, isAssigning }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${isAssignedToOther ? "opacity-50" : "hover:bg-gray-50"} transition-colors`}>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-sm">
        {client.full_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {client.full_name || "Unknown"}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{client.email}</span>
        </div>
        {isAssignedToOther && (
          <p className="text-[11px] text-orange-500 font-medium mt-0.5">Assigned to another practitioner</p>
        )}
      </div>

      {/* Assign Button */}
      {isAssignedToOther ? (
        <span className="text-xs text-gray-400 font-medium">Unavailable</span>
      ) : (
        <Button
          size="sm"
          onClick={onAssign}
          disabled={isAssigning}
          className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-xs font-semibold"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          Assign
        </Button>
      )}
    </div>
  );
}