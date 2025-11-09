import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function TrainerCard({ trainer }) {
  if (!trainer) return null;

  return (
    <Card className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] border-none glow-blue">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40">
            {trainer.profile_photo_url ? (
              <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/80 uppercase tracking-wider font-bold">Your Trainer</p>
            <h3 className="text-xl font-black italic text-white">{trainer.full_name}</h3>
            <p className="text-sm text-white/90 mt-1">You're never alone on your journey</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}