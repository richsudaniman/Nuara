import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Card className="bg-white border-teal-100 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">LOG PAIN LEVEL</h2>

        {/* Pain Level Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Pain Level: {painLevel}</span>
            <span className="text-sm font-semibold text-gray-600">{getPainText(painLevel)}</span>
          </div>

          {/* Color Slider */}
          <div className="relative">
            <div className="h-8 rounded-lg overflow-hidden flex mb-4">
              {[...Array(11)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 ${getPainColor(i)} ${painLevel === i ? 'ring-4 ring-teal-500 ring-inset' : ''}`}
                  onClick={() => setPainLevel(i)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
            
            {/* Numeric Range */}
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>0 (No Pain)</span>
              <span>10 (Worst Pain)</span>
            </div>
          </div>

          {/* Visual Squares */}
          <div className="grid grid-cols-10 gap-2 mt-4">
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPainLevel(i + 1)}
                className={`aspect-square rounded-lg transition-all ${
                  painLevel >= i + 1 ? getPainColor(i + 1) : 'bg-gray-100'
                } ${painLevel === i + 1 ? 'ring-2 ring-teal-500 scale-110' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Body Area */}
        <div className="mb-4">
          <label className="text-sm font-bold text-gray-700 mb-2 block">Body Area</label>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="bg-white">
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
          <label className="text-sm font-bold text-gray-700 mb-2 block">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="bg-white"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-700 mb-2 block">Notes (Optional)</label>
          <Textarea
            placeholder="Describe your pain (e.g., sharp, dull, comes and goes...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !selectedArea}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-6 rounded-xl shadow-md"
        >
          + LOG PAIN
        </Button>
      </CardContent>
    </Card>
  );
}