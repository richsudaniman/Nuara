import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function DailyCheckIn({ currentStatus, onStatusUpdate, isLoading }) {
  
  return (
    <Card className="bg-white border-2 border-gray-100 shadow-sm rounded-xl overflow-hidden mb-5">
      <CardContent className="p-5">
        <div className="flex flex-col items-start gap-4">
          <div>
            <h3 className="font-black italic text-[#1a1a1a] text-lg">DAILY CHECK-IN</h3>
            <p className="text-sm text-gray-500">Did you hit your nutrition goals today?</p>
          </div>
          
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => onStatusUpdate('hit')}
              disabled={isLoading}
              variant={currentStatus === 'hit' ? 'default' : 'outline'}
              className={`flex-1 gap-2 font-bold h-12 text-base ${
                currentStatus === 'hit' 
                  ? 'bg-green-500 hover:bg-green-600 border-green-500 text-white shadow-md shadow-green-200' 
                  : 'text-green-600 border-green-200 hover:bg-green-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              Yes, I did
            </Button>
            
            <Button
              onClick={() => onStatusUpdate('missed')}
              disabled={isLoading}
              variant={currentStatus === 'missed' ? 'default' : 'outline'}
              className={`flex-1 gap-2 font-bold h-12 text-base ${
                currentStatus === 'missed' 
                  ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white shadow-md shadow-red-200' 
                  : 'text-red-600 border-red-200 hover:bg-red-50'
              }`}
            >
              <XCircle className="w-5 h-5" />
              Missed it
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}