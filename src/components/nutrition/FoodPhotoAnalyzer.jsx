import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Plus } from "lucide-react";

export default function FoodPhotoAnalyzer({ onFoodAnalyzed }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const test = async () => {
    setStatus('testing');
    setMessage('TEST MODE - If you see this, the component updated!');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black italic text-[#1a1a1a]">FOOD ANALYZER v2.0</h3>
            <p className="text-xs text-gray-600">Component rebuilt from scratch</p>
          </div>
        </div>

        <Button onClick={test} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black">
          CLICK TO TEST IF WORKING
        </Button>

        {message && (
          <div className="p-4 bg-green-100 border-2 border-green-500 rounded">
            <p className="text-green-800 font-bold">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}