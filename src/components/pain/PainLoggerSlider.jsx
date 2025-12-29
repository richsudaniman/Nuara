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
    <Card className="bg-white border-0 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">LOG PAIN LEVEL</h2>

        {/* Pain Level Display */}
        <div className="mb-6">
          <div className="mb-3">
            <span className="text-sm font-semibold text-gray-900">
              Pain Level: <span className="text-teal-600 text-lg">{painLevel}</span> - {getPainText(painLevel)}
            </span>
          </div>

          {/* Gradient Slider */}
          <div className="mb-4">
            <Slider
              value={[painLevel]}
              onValueChange={(value) => setPainLevel(value[0])}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Range Labels */}
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span>0 (No Pain)</span>
            <span>10 (Worst Pain)</span>
          </div>

          {/* Color Squares */}
          <div className="grid grid-cols-10 gap-2">
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPainLevel(i + 1)}
                className={`aspect-square rounded-lg transition-all ${getPainColor(i + 1)}`}
              />
            ))}
          </div>
        </div>

        {/* Body Area */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Body Area</label>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Select body area" />
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
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="bg-white border-gray-300"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Notes (Optional)</label>
          <Textarea
            placeholder="Describe your pain (e.g., sharp, dull, comes and goes...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white border-gray-300 min-h-[80px]"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !selectedArea}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-6 rounded-lg"
        >
          + LOG PAIN
        </Button>
      </CardContent>
    </Card>
  );
}