import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Plus, X, AlertCircle } from "lucide-react";

const bodyAreas = [
  { value: "neck", label: "Neck" },
  { value: "upper_back", label: "Upper Back" },
  { value: "mid_back", label: "Mid Back" },
  { value: "lower_back", label: "Lower Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "hips", label: "Hips" },
  { value: "knees", label: "Knees" },
  { value: "ankles", label: "Ankles" },
  { value: "wrists", label: "Wrists" },
  { value: "elbows", label: "Elbows" },
  { value: "head", label: "Head" },
  { value: "other", label: "Other" }
];

const painTypes = [
  { value: "sharp", label: "Sharp" },
  { value: "dull", label: "Dull" },
  { value: "throbbing", label: "Throbbing" },
  { value: "burning", label: "Burning" },
  { value: "tingling", label: "Tingling" },
  { value: "numbness", label: "Numbness" },
  { value: "stiffness", label: "Stiffness" }
];

export default function PainLogger({ onLogPain, isLoading }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pain_level: 5,
    affected_areas: [],
    pain_type: "",
    notes: "",
    triggers: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.affected_areas.length === 0) {
      alert("Please select at least one affected area");
      return;
    }

    onLogPain(formData);
    
    setFormData({
      pain_level: 5,
      affected_areas: [],
      pain_type: "",
      notes: "",
      triggers: "",
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const toggleArea = (area) => {
    setFormData(prev => ({
      ...prev,
      affected_areas: prev.affected_areas.includes(area)
        ? prev.affected_areas.filter(a => a !== area)
        : [...prev.affected_areas, area]
    }));
  };

  if (!showForm) {
    return (
      <Card className="bg-white border-0 shadow-sm rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Pain Log</h3>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-md shadow-teal-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Log Pain
            </Button>
          </div>
          <p className="text-sm text-gray-500">Track your pain levels and affected areas to monitor your recovery progress.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#1a1a1a]">Log Your Pain</h3>
          <Button
            onClick={() => setShowForm(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pain Level Slider */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-3 block">
              Pain Level: <span className="text-2xl text-teal-600 font-black">{formData.pain_level}</span>/10
            </label>
            <Slider
              value={[formData.pain_level]}
              onValueChange={([value]) => setFormData({ ...formData, pain_level: value })}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>No Pain</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="bg-gray-50"
            />
          </div>

          {/* Affected Areas */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Affected Areas *</label>
            <div className="grid grid-cols-2 gap-2">
              {bodyAreas.map(area => (
                <button
                  key={area.value}
                  type="button"
                  onClick={() => toggleArea(area.value)}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                    formData.affected_areas.includes(area.value)
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Type */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Type of Pain</label>
            <div className="grid grid-cols-2 gap-2">
              {painTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, pain_type: type.value })}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                    formData.pain_type === type.value
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">What triggered it?</label>
            <Input
              placeholder="e.g., sitting too long, bending over..."
              value={formData.triggers}
              onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
              className="bg-gray-50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Additional Notes</label>
            <Textarea
              placeholder="Any other details about your pain..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-gray-50 min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl py-6 shadow-lg shadow-teal-200"
          >
            {isLoading ? "Saving..." : "Save Pain Log"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}