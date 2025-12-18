import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Plus, AlertCircle } from "lucide-react";

export default function FoodPhotoAnalyzer({ onFoodAnalyzed }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      // Upload photo
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Analyze food
      const response = await base44.functions.invoke('analyzeFoodV2', { image_url: file_url });
      
      if (response.data.success && response.data.foods?.length > 0) {
        const food = response.data.foods[0];
        setResults(food);
        
        // Add to log
        const today = new Date().toISOString().split('T')[0];
        await onFoodAnalyzed({
          date: today,
          meal_name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          meal_type: 'Snack'
        });
      } else {
        setError(response.data.error || 'No food detected');
      }
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
      e.target.value = '';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black italic text-[#1a1a1a]">SNAP & TRACK</h3>
            <p className="text-xs text-gray-600">Take a photo to analyze nutrition</p>
          </div>
        </div>

        <input
          id="food-photo-upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={analyzing}
          className="hidden"
        />
        <label htmlFor="food-photo-upload" className="block">
          <Button
            type="button"
            disabled={analyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('food-photo-upload').click();
            }}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ANALYZING...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                UPLOAD PHOTO
              </>
            )}
          </Button>
        </label>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {results && (
          <div className="p-4 bg-white border-2 border-purple-300 rounded space-y-2">
            <h4 className="font-black italic text-purple-900">{results.name.toUpperCase()}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Calories:</span>
                <span className="font-bold ml-1">{results.calories}</span>
              </div>
              <div>
                <span className="text-gray-600">Protein:</span>
                <span className="font-bold ml-1">{results.protein}g</span>
              </div>
              <div>
                <span className="text-gray-600">Carbs:</span>
                <span className="font-bold ml-1">{results.carbs}g</span>
              </div>
              <div>
                <span className="text-gray-600">Fats:</span>
                <span className="font-bold ml-1">{results.fats}g</span>
              </div>
            </div>
            <div className="pt-2 border-t border-purple-200">
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Added to your log!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}