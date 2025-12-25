import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function TrainerCard({ trainer }) {
  if (!trainer) return null;

  return (
    <Card className="bg-white border-0 shadow-sm rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {trainer.profile_photo_url ? (
              <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium">Your Trainer</p>
            <h3 className="text-base font-bold text-[#1a1a1a]">{trainer.full_name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Here to guide you</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}