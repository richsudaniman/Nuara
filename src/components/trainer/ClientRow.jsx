import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, UserMinus, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ClientRow({ client, assignment, onUnassign, isUnassigning }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-700 font-bold text-sm">
        {client.full_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "?"}
      </div>

      {/* Info */}
      <Link
        to={`${createPageUrl("TrainerClientDetail")}?clientId=${client.id}`}
        className="flex-1 min-w-0"
      >
        <p className="text-sm font-semibold text-gray-900 truncate">
          {client.full_name || "Unknown"}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1 truncate">
            <Mail className="w-3 h-3 flex-shrink-0" />
            {client.email}
          </span>
          {assignment?.assigned_date && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-3 h-3" />
              {format(new Date(assignment.assigned_date), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </Link>

      {/* Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUnassign}
        disabled={isUnassigning}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2"
      >
        <UserMinus className="w-4 h-4" />
      </Button>

      <Link to={`${createPageUrl("TrainerClientDetail")}?clientId=${client.id}`}>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </Link>
    </div>
  );
}