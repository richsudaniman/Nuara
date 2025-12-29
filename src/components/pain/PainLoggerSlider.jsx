import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const bodyAreas = [
  "Neck", "Upper Back", "Mid Back", "Lower Back", 
  "Shoulders", "Hips", "Knees", "Ankles", "Wrists", 
  "Elbows", "Head", "Other"
];

export default function PainLoggerSlider({ onLogPain, isLoading }) {
  const [painLevel, setPainLevel] = useState(5);
  const [selectedArea, setSelectedArea] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const getPainColor = (level) => {
    if (level <= 2) return "bg-yellow-400";
    if (level <= 4) return "bg-yellow-500";
    if (level <= 6) return "bg-orange-400";
    if (level <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPainText = (level) => {
    if (level === 0) return "No Pain";
    if (level <= 3) return "Mild Pain";
    if (level <= 5) return "Moderate Pain";
    if (level <= 7) return "Severe Pain";
    return "Worst Pain";
  };

  const getSliderColor = (level) => {
    const percentage = (level / 10) * 100;
    return `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${percentage/3}%, #fb923c ${percentage/2}%, #ef4444 ${percentage}%, #d1d5db ${percentage}%, #d1d5db 100%)`;
  };

  const handleSubmit = () => {
    if (!selectedArea) {
      alert("Please select a body area");
      return;
    }

    onLogPain({
      pain_level: painLevel,
      affected_areas: [selectedArea.toLowerCase().replace(" ", "_")],
      notes,
      date
    });

    // Reset
    setPainLevel(5);
    setSelectedArea("");
    setNotes("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-teal-50/30 border-0 shadow-lg rounded-3xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Pain Level</h2>
          <p className="text-sm text-gray-500">Track your pain to monitor recovery progress</p>
        </div>

        {/* Large Pain Level Display */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="text-center mb-4">
            <div className="text-6xl font-black text-teal-600 mb-2">{painLevel}</div>
            <div className="text-lg font-semibold text-gray-700">{getPainText(painLevel)}</div>
          </div>

          {/* Simple Number Buttons */}
          <div className="grid grid-cols-11 gap-2">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPainLevel(i)}
                className={`aspect-square rounded-xl font-bold text-sm transition-all ${
                  painLevel === i 
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">
            <span>No Pain</span>
            <span>Worst Pain</span>
          </div>
        </div>

        {/* Body Area */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Affected Body Area *</label>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="bg-white border-gray-200 h-12 rounded-xl">
              <SelectValue placeholder="Select where you feel pain" />
            </SelectTrigger>
            <SelectContent>
              {bodyAreas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="bg-white border-gray-200 h-12 rounded-xl"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Additional Notes</label>
          <Textarea
            placeholder="Describe your pain (sharp, dull, radiating, etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white border-gray-200 min-h-[100px] rounded-xl"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !selectedArea}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-6 rounded-xl shadow-md text-base"
        >
          {isLoading ? 'Logging...' : 'Log Pain Entry'}
        </Button>
      </CardContent>
    </Card>
  );
}